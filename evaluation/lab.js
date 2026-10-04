import {assertEvaluationNotSamples} from '../src/samplePolicy.js'
import {updatePresentation} from './presentation.js'
import {scoringPanel} from './scoringPanel.js'
import {lockProtocol,markCase,recordScore,skipCase,finalize,exportResults,saveRecord,SESSIONS_KEY,MAPPINGS_KEY} from './protocol.js'
import {createProfileStore,profilePreferences} from '../src/styleProfile.js'
import {decodePhoto} from '../src/imageUpload.js'
import {loadFaceDetector,detectFaces} from '../src/faceDetection.js'
import {compareStyles} from '../src/styleComparison.js'
import {createImagePipeline} from '../src/imagePipeline.js'
import {downloadBlob} from '../src/exportImage.js'
const $=id=>document.getElementById(id),status=message=>$('status').textContent=message
let session=null,mapping=null,files=new Map(),current=null,busy=false
const read=key=>JSON.parse(localStorage.getItem(key)||'{}')
function save(next){saveRecord(localStorage,SESSIONS_KEY,next.id,next);session=next;refresh()}
function refresh(){
 updatePresentation(session,busy)
 $('protocol-status').textContent=session?`${session.id} · Locked ${session.lockedAt}\n${session.scope.replace('experimental face slimming excluded','Face Slimming outside the formal scope')}\nAcceptance: ${session.criteria}\nSkip policy: ${session.skipPolicy}`:'No locked session.'
 $('process').disabled=!session||!!session.finalizedAt||busy
 $('finalize').disabled=!session||!!session.finalizedAt||busy||session.cases.some(c=>!['scored','skipped','failed'].includes(c.status))
 $('export').disabled=!session?.finalizedAt
 for(const id of ['criteria','skip-policy'])$(id).disabled=Boolean(session)
 $('skip').disabled=!session||!!session.finalizedAt||busy
 $('dataset').disabled=busy
 if(session){$('criteria').value=session.criteria;$('skip-policy').value=session.skipPolicy;const value=$('case').value;$('case').replaceChildren(...session.cases.map(c=>new Option(`${c.id} · ${c.status}`,c.id)));if(session.cases.some(c=>c.id===value))$('case').value=value}
}
function sessions(){const records=read(SESSIONS_KEY);$('sessions').replaceChildren(new Option('Select session',''),...Object.values(records).map(s=>new Option(`${s.id} · ${s.finalizedAt?'finalized':'in progress'}`,s.id)))}
$('dataset').addEventListener('change',async()=>{$('lock').disabled=true;try{const selected=[...$('dataset').files];files=new Map();for(const file of selected){const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',await file.arrayBuffer())),b=>b.toString(16).padStart(2,'0')).join('');files.set(hash,file)}status(`${files.size} distinct files loaded in memory only.`)}catch(e){status(e.message)}finally{$('lock').disabled=false}})
$('lock').addEventListener('click',()=>{try{
 if(session&&!session.finalizedAt)throw new Error('Finish the current session or reload to explicitly start a separate experiment.')
 assertEvaluationNotSamples([...files.keys()])
 const result=lockProtocol({id:crypto.randomUUID(),profile:createProfileStore(()=>localStorage).load(),digests:[...files.keys()],criteria:$('criteria').value,skipPolicy:$('skip-policy').value})
 // Mapping is separately persisted before exposing a locked session for scoring.
 saveRecord(localStorage,MAPPINGS_KEY,result.session.id,result.mapping);mapping=result.mapping;save(result.session);current=null;$('results').textContent='';$('outputs').replaceChildren();sessions();status('Protocol, setup profile and dataset frozen. No held-out photo was added to training.')
}catch(e){status(e.message)}})
$('resume').addEventListener('click',()=>{try{const found=read(SESSIONS_KEY)[$('sessions').value],map=read(MAPPINGS_KEY)[$('sessions').value];if(!found||!map)throw new Error('Session or mapping unavailable.');session=found;mapping=map;current=null;$('outputs').replaceChildren();$('results').textContent=session.finalizedAt?JSON.stringify(exportResults(session,mapping),null,2):'';refresh();status('Session restored. Reselect its original held-out files.')}catch(e){status(e.message)}})
$('case').addEventListener('change',()=>{current=null;$('outputs').replaceChildren();$('case-status').textContent='';refresh()})
function paint(canvas,pixels){canvas.width=pixels.width;canvas.height=pixels.height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels.data),pixels.width,pixels.height),0,0)}
$('process').addEventListener('click',async()=>{
 const id=$('case').value,c=session?.cases.find(c=>c.id===id);if(!c||busy||session.finalizedAt)return
 if(['failed','skipped','scored'].includes(c.status)){status('This case is complete; its record is retained.');return}
 if(!files.has(c.digest)){status('Reselect the matching held-out file. Missing files are not silently discarded.');return}
 busy=true;refresh();$('case-status').textContent='Decoding and detecting locally…';$('outputs').replaceChildren();current=null
 $('case').disabled=true;$('resume').disabled=true;$('lock').disabled=true
 const started=performance.now();let detection='not completed'
 try{
  const img=await decodePhoto(files.get(c.digest)),canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;canvas.getContext('2d').drawImage(img,0,0)
  const detector=await loadFaceDetector(),faces=detectFaces(detector,canvas).faces;detection=`${faces.length} face(s)`
  if(faces.length!==1){if(c.status==='pending')save(markCase(session,id,{status:'skipped',detection,reason:'Exactly one detected face is required.'}));throw new Error('Case skipped: exactly one face required.')}
  const original=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height),landmarks=faces[0].normalizedLandmarks,pipeline=createImagePipeline(original,landmarks)
  if(pipeline.geometry.reason){if(c.status==='pending')save(markCase(session,id,{status:'skipped',detection,reason:pipeline.geometry.reason}));throw new Error('Case skipped: eye geometry is unusable.')}
  const result=compareStyles(original,landmarks,profilePreferences(session.profile),session.profile,false)
  mapping[id].initial=Object.fromEntries(['A','B'].map(label=>[label,result.outputs.find(r=>r.mode===mapping[id][label]).applied.eye]));saveRecord(localStorage,MAPPINGS_KEY,session.id,mapping)
  if(c.status==='pending')save(markCase(session,id,{status:'ready',detection,identical:result.identical,latencyMs:performance.now()-started}))
  current={id,original,pipeline,outputs:result.outputs}
  $('case-status').textContent=`${id} · ready for blinded scoring. Both outputs use the same original. ${result.identical?'Outputs are pixel-identical.':''}`
  for(const label of ['A','B']){
   const result=current.outputs.find(r=>r.mode===mapping[id][label]),done=session.cases.find(c=>c.id===id).results[label]
   $('outputs').append(scoringPanel({label,pixels:result,initialEye:result.applied.eye,done,pipeline,onError:status,onScore:score=>{
    save(recordScore(session,id,label,score));status(`${id} ${label}: score locked; identity still hidden.`)
   }}))
  }
 }catch(e){if(session.cases.find(c=>c.id===id).status==='pending'){try{save(markCase(session,id,{status:'failed',detection,reason:e.message}))}catch(storageError){status(`Record not saved: ${storageError.message}`);$('case-status').textContent=e.message;return}}$('case-status').textContent=e.message;status('Skipped/failed cases remain in the record and do not count as zero corrections.')}
 finally{busy=false;$('case').disabled=false;$('resume').disabled=false;$('lock').disabled=false;refresh()}
})
$('finalize').onclick=()=>{try{if(!confirm('Finalize this session? Scores cannot be changed after revealing methods.'))return;save(finalize(session));$('results').textContent=JSON.stringify(exportResults(session,mapping),null,2);sessions();status('Finalized. Mapping revealed; no scores may be changed.')}catch(e){status(e.message)}}
$('export').onclick=()=>{try{downloadBlob(new Blob([JSON.stringify(exportResults(session,mapping),null,2)],{type:'application/json'}),`StyleMe-evaluation-${session.id}.json`)}catch(e){status(e.message)}}
$('skip').onclick=()=>{try{save(skipCase(session,$('case').value,$('skip-reason').value));$('outputs').replaceChildren();current=null;$('skip-reason').value='';status('Case retained as skipped. It does not count as zero corrections.')}catch(e){status(e.message)}}
try{sessions()}catch(e){status(`Local records could not be read: ${e.message}`)}

refresh()
