import {validateProfile} from '../src/styleProfile.js'
// Evaluation bookkeeping is independent of images, the UI and the editing engine.
// Never persist pixels, filenames or raw landmarks here.
export const SESSIONS_KEY='styleme.evaluation.sessions.v1'
export const MAPPINGS_KEY='styleme.evaluation.mappings.v1'
const copy=value=>JSON.parse(JSON.stringify(value))
const fail=message=>{throw new Error(message)}
export function lockProtocol({id,profile,digests,criteria,skipPolicy},random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/2**32){
 profile=validateProfile(profile)
 if(!id||profile?.examples?.length!==5||profile.examples.some(e=>e.eye===null))fail('Exactly five confirmed setup examples are required.')
 if(!Array.isArray(digests)||digests.length!==10||new Set(digests).size!==10||digests.some(d=>!/^[a-f0-9]{64}$/.test(d)))fail('Select ten distinct held-out photos.')
 if(digests.some(d=>profile.examples.some(e=>e.photoId===d)))fail('A held-out photo duplicates a setup photo.')
 if(!criteria?.trim()||!skipPolicy?.trim())fail('Specify acceptance criteria and failure/skip handling before locking.')
 const cases=digests.map((digest,i)=>({id:`H${String(i+1).padStart(2,'0')}`,digest,status:'pending',detection:null,skipReason:null,identical:null,results:{}}))
 const mapping=Object.fromEntries(cases.map(c=>[c.id,random()<.5?{A:'fixed',B:'adaptive'}:{A:'adaptive',B:'fixed'}]))
 return {session:{id,version:1,lockedAt:new Date().toISOString(),scope:'Eye Enlargement only; Face Slimming outside the formal scope',correctionUnit:'One supported parameter requiring adjustment; intermediate slider movements do not count.',criteria:criteria.trim(),skipPolicy:skipPolicy.trim(),profile:copy(profile),cases,finalizedAt:null},mapping}
}
function mutable(session,caseId){if(session.finalizedAt)fail('Session is finalized. Scores cannot change.');const c=session.cases.find(c=>c.id===caseId);if(!c)fail('Unknown case.');return c}
export function markCase(session,caseId,{status,detection,reason=null,identical=null,latencyMs=null}){
 const next=copy(session),c=mutable(next,caseId)
 if(c.status!=='pending')fail('Case processing is already recorded.')
 if(!['ready','skipped','failed'].includes(status))fail('Invalid case status.')
 if(status!=='ready'&&!reason)fail('Failure/skip reason is required.')
 Object.assign(c,{status,detection,skipReason:reason,identical:status==='ready'?Boolean(identical):null,latencyMs:Number.isFinite(latencyMs)?Math.round(latencyMs):null})
 return next
}
export function recordScore(session,caseId,label,{correction,accepted,artifacts=''}){
 const next=copy(session),c=mutable(next,caseId)
 if(c.status!=='ready'||!['A','B'].includes(label)||c.results[label])fail('This result is unavailable or already scored.')
 if(typeof correction!=='boolean'||!Number.isInteger(accepted)||accepted<0||accepted>100)fail('A valid accepted setting and correction decision are required.')
 c.results[label]={label,correctionCount:correction?1:0,parameter:correction?'eye':null,accepted,artifacts:String(artifacts),completedAt:new Date().toISOString()}
 if(c.results.A&&c.results.B)c.status='scored'
 return next
}
export function finalize(session){
 if(session.finalizedAt)fail('Session already finalized.')
 if(session.cases.some(c=>!['scored','skipped','failed'].includes(c.status)))fail('Score both results or retain a documented skip/failure for all ten cases.')
 return {...copy(session),finalizedAt:new Date().toISOString()}
}
export function exportResults(session,mapping){
 if(!session.finalizedAt)fail('Finalize scoring before revealing method identities.')
 const successful=session.cases.filter(c=>c.status==='scored'),totals={fixed:0,adaptive:0}
 const cases=session.cases.map(c=>({caseId:c.id,digest:c.digest,status:c.status,detection:c.detection,skipReason:c.skipReason,identical:c.identical,latencyMs:c.latencyMs,results:Object.entries(c.results).map(([label,r])=>{
  const method=mapping[c.id]?.[label];if(!['fixed','adaptive'].includes(method))fail('Missing randomized mapping.');if(c.status==='scored')totals[method]+=r.correctionCount;return {...r,method,initialSetting:mapping[c.id]?.initial?.[label]??null}
 })}))
 return {version:1,sessionId:session.id,lockedAt:session.lockedAt,finalizedAt:session.finalizedAt,scope:session.scope,correctionUnit:session.correctionUnit,acceptanceCriteria:session.criteria,skipPolicy:session.skipPolicy,profile:copy(session.profile),mapping:copy(mapping),cases,summary:{photos:session.cases.length,successful:successful.length,skipped:session.cases.filter(c=>c.status==='skipped').length,failed:session.cases.filter(c=>c.status==='failed').length,identical:successful.filter(c=>c.identical).length,corrections:totals,meanCorrections:successful.length?{fixed:totals.fixed/successful.length,adaptive:totals.adaptive/successful.length}:null,relativeReduction:totals.fixed>0?(totals.fixed-totals.adaptive)/totals.fixed:null,denominator:`${successful.length}/${session.cases.length} paired scored cases; failures/skips excluded from correction means and retained separately`}}
}
export function skipCase(session,caseId,reason){
 const next=copy(session),c=mutable(next,caseId)
 if(!['pending','ready'].includes(c.status)||!reason?.trim())fail('Only unfinished cases can be skipped with an explicit reason.')
 c.status='skipped';c.skipReason=reason.trim();return next
}
export function saveRecord(storage,key,id,value){
 const records=JSON.parse(storage.getItem(key)||'{}'),old=records[id]
 if(old?.finalizedAt)fail('Finalized record cannot be overwritten.')
 if(key===SESSIONS_KEY&&old){
  for(const field of ['id','version','lockedAt','scope','correctionUnit','criteria','skipPolicy','profile'])
   if(JSON.stringify(old[field])!==JSON.stringify(value[field]))fail('Locked protocol/profile cannot change.')
  if(old.cases.length!==value.cases.length)fail('Frozen dataset cannot change.')
  for(let i=0;i<old.cases.length;i++){
   const prior=old.cases[i],next=value.cases[i]
   if(prior.id!==next.id||prior.digest!==next.digest)fail('Frozen dataset cannot change.')
   if(['scored','skipped','failed'].includes(prior.status)&&JSON.stringify(prior)!==JSON.stringify(next))fail('Completed case cannot change.')
   if(prior.status==='ready'&&next.status==='pending')fail('Cannot revert case processing.')
   for(const [label,score]of Object.entries(prior.results))if(JSON.stringify(score)!==JSON.stringify(next.results[label]))fail('A score changed in another tab; reload the session.')
  }
 }
 if(key===MAPPINGS_KEY&&old){
  const session=JSON.parse(storage.getItem(SESSIONS_KEY)||'{}')[id]
  if(session?.finalizedAt)fail('Finalized mapping cannot change.')
  for(const [caseId,pair]of Object.entries(old)){
   if(pair.A!==value[caseId]?.A||pair.B!==value[caseId]?.B)fail('Randomized assignment cannot change.')
   if(pair.initial&&JSON.stringify(pair.initial)!==JSON.stringify(value[caseId]?.initial))fail('Regenerated strengths differ from the original run; do not mix engine versions.')
  }
 }
 records[id]=copy(value);storage.setItem(key,JSON.stringify(records))
}
