import {scoringPanel} from '../evaluation/scoringPanel.js'
import {createImagePipeline} from '../src/imagePipeline.js'
import {facePoints,faceImage} from './faceFixtures.js'
import {PROFILE_KEY} from '../src/styleProfile.js'
import {SESSIONS_KEY,MAPPINGS_KEY} from '../evaluation/protocol.js'
const frame=document.getElementById('lab'),report=document.getElementById('report'),button=document.getElementById('run')
const wait=async predicate=>{const end=performance.now()+90000;while(!predicate()){if(performance.now()>end)throw new Error('Timed out');await new Promise(r=>setTimeout(r,50))}}
button.onclick=async()=>{
 button.disabled=true;report.textContent='Synthetic fixtures only.\n'
 const backup=new Map([PROFILE_KEY,SESSIONS_KEY,MAPPINGS_KEY].map(k=>[k,localStorage.getItem(k)]))
 const check=(value,label)=>{if(!value)throw new Error(label);report.textContent+=`PASS: ${label}\n`}
 let win=frame.contentWindow,doc=frame.contentDocument
 const get=id=>doc.getElementById(id)
 try{
  const profile={version:1,examples:Array.from({length:5},(_,i)=>({photoId:i.toString(16).padStart(64,'0'),eye:40+i*5,face:0,geometry:{eyeAspect:.2+i*.01,faceWidthBalance:1}}))}
  localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));const setup=localStorage.getItem(PROFILE_KEY)
  await wait(()=>get('lock'));win.confirm=()=>true
  const files=[]
  for(let i=0;i<10;i++){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle=`rgb(${i*20},100,180)`;ctx.fillRect(0,0,128,128);files.push(new File([await new Promise(r=>canvas.toBlob(r,'image/png'))],`synthetic-${i}.png`,{type:'image/png'}))}
  const dt=new DataTransfer();files.forEach(f=>dt.items.add(f));get('dataset').files=dt.files;get('dataset').dispatchEvent(new win.Event('change'));await wait(()=>get('status').textContent.includes('10 distinct'))
  get('lock').click();check(get('status').textContent.includes('Specify acceptance'),'acceptance and skip criteria required before lock')
  get('criteria').value='Synthetic UI test only; no acceptance or improvement claim.';get('skip-policy').value='Retain all skips and failures separately. No zero corrections assigned.';get('lock').click()
  check(doc.querySelector('[data-stage-panel="0"]').hidden && !doc.querySelector('[data-stage-panel="1"]').hidden,'locked session advances to the blinded scoring stage')
  check(get('criteria').disabled&&get('skip-policy').disabled,'protocol controls freeze after locking')
  const id=get('protocol-status').textContent.split(' · ')[0],record=JSON.parse(localStorage.getItem(SESSIONS_KEY))[id],mapping=JSON.parse(localStorage.getItem(MAPPINGS_KEY))[id]
  check(record.cases.length===10&&Object.keys(mapping).length===10&&!record.mapping,'ten cases and separately stored randomized assignments')
  check(get('export').disabled&&get('finalize').disabled&&!get('results').textContent,'reveal/export blocked before scoring is complete')
  get('process').click();await wait(()=>!get('process').disabled)
  const processed=JSON.parse(localStorage.getItem(SESSIONS_KEY))[id].cases[0]
  check(processed.status==='skipped'&&processed.detection==='0 face(s)','real MediaPipe skips a synthetic no-face fixture')
  for(const c of record.cases.slice(1)){get('case').value=c.id;get('case').dispatchEvent(new win.Event('change'));get('skip-reason').value='Synthetic workflow fixture: explicit planned skip.';get('skip').click()}
  check(!get('finalize').disabled,'all ten retained outcomes allow finalization')
  check(!doc.querySelector('[data-stage-panel="2"]').hidden && !get('review-list').textContent.includes('adaptive'),'completed cases advance to review without revealing identities')
  get('finalize').click();const output=JSON.parse(get('results').textContent)
  check(output.summary.photos===10&&output.summary.skipped===10&&output.summary.successful===0&&output.summary.meanCorrections===null&&output.summary.relativeReduction===null,'zero successful cases produce no fabricated corrections or improvement')
  check(!doc.querySelector('[data-stage-panel="3"]').hidden,'finalized session opens export stage')
  check(!get('export').disabled&&get('finalize').disabled&&get('process').disabled,'finalization reveals mapping and locks scoring')
  check(!JSON.stringify(output).includes('synthetic-0.png')&&!JSON.stringify(output).includes('data:image'),'export contains no filenames or image data')
  check(localStorage.getItem(PROFILE_KEY)===setup,'held-out processing never changes training profile')
  const keys=Object.keys(output.mapping);check(keys.length===10,'finalized JSON contains auditable mapping')
  const image=faceImage(),pipeline=createImagePipeline(image,facePoints()),initial=pipeline.render(50,0),pixels={...initial,data:new Uint8ClampedArray(initial.data)}
  let score=null,error=''
  const panel=scoringPanel({label:'A',pixels,initialEye:50,pipeline,onScore:value=>score=value,onError:value=>error=value})
  document.body.append(panel)
  check(!panel.textContent.includes('adaptive')&&!panel.textContent.includes('Fixed Preset')&&panel.querySelector('.accepted').value==='','production scoring component hides method and initial strength')
  panel.querySelector('.accepted').value='65';panel.querySelector('.correct').checked=true;panel.querySelector('.score').click()
  check(!score&&error.includes('Preview'),'a correction must be previewed before scoring')
  panel.querySelector('.preview').click();panel.querySelector('.score').click()
  check(score?.correction&&score.accepted===65&&panel.querySelector('.score').disabled,'actual scoring component records final corrected parameter and locks')
  const unchanged=scoringPanel({label:'B',pixels,initialEye:50,pipeline,onScore:value=>score=value,onError:value=>error=value})
  document.body.append(unchanged);unchanged.querySelector('.score').click()
  check(score.correction===false&&score.accepted===50,'unchanged anonymous output records zero corrections without displaying its initial value')
  panel.remove();unchanged.remove()
  report.textContent+='Complete. Anonymous scoring UI used synthetic pixels/landmarks through the real warp; no-face Lab fixtures tested MediaPipe skips. These are mechanics checks, not portrait evaluation results.\n' 
 }catch(e){report.textContent+=`FAIL / BLOCKED: ${e.message}\n`}
 finally{for(const [k,v]of backup){if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}frame.src='/evaluation/';button.disabled=false;report.textContent+='Previous profile and evaluation records restored.'}
}
