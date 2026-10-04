import test from 'node:test'
import assert from 'node:assert/strict'
import {lockProtocol,markCase,recordScore,finalize,exportResults,saveRecord} from '../evaluation/protocol.js'
const digest=n=>n.toString(16).padStart(64,'0')
const profile={version:1,examples:Array.from({length:5},(_,i)=>({photoId:digest(i),eye:50,face:0,geometry:{eyeAspect:.2,faceWidthBalance:1}}))}
const config=()=>({id:'synthetic-mechanics-only',profile,digests:Array.from({length:10},(_,i)=>digest(10+i)),criteria:'Synthetic mechanics test criteria',skipPolicy:'Retain failures/skips separately, exclude from paired correction means.'})
test('locks five setup and ten held-out cases without mutating teaching data',()=>{const before=JSON.stringify(profile),{session,mapping}=lockProtocol(config(),()=>.1);assert.equal(session.cases.length,10);assert.equal(JSON.stringify(profile),before);assert.equal(mapping.H01.A,'fixed');assert.ok(!JSON.stringify(session).includes('filename'));assert.equal(session.cases[0].status,'pending')})
test('refuses missing criteria, duplicates, and setup/evaluation leakage',()=>{assert.throws(()=>lockProtocol({...config(),criteria:''}));assert.throws(()=>lockProtocol({...config(),digests:Array(10).fill(digest(10))}));assert.throws(()=>lockProtocol({...config(),digests:[digest(0),...config().digests.slice(1)]}));assert.throws(()=>lockProtocol({...config(),profile:{examples:[]}}))})
test('A/B assignments can swap and are separate from blinded records',()=>{const a=lockProtocol(config(),()=>.1),b=lockProtocol(config(),()=>.9);assert.equal(a.mapping.H01.A,b.mapping.H01.B);assert.ok(!('mapping'in a.session));assert.throws(()=>exportResults(a.session,a.mapping));assert.throws(()=>finalize(a.session))})
test('records corrections per parameter, protects scored results and retains failures',()=>{
 let {session,mapping}=lockProtocol(config(),()=>.1)
 session=markCase(session,'H01',{status:'ready',detection:'1 face',identical:false})
 session=recordScore(session,'H01','A',{correction:true,accepted:60,artifacts:'synthetic'})
 assert.throws(()=>recordScore(session,'H01','A',{correction:false,accepted:50}))
 assert.throws(()=>recordScore(session,'H01','B',{correction:true,accepted:NaN}))
 session=recordScore(session,'H01','B',{correction:false,accepted:50})
 for(let i=2;i<=10;i++)session=markCase(session,`H${String(i).padStart(2,'0')}`,{status:i===2?'failed':'skipped',detection:'not usable',reason:'synthetic fixture'})
 session=finalize(session);const result=exportResults(session,mapping)
 assert.equal(result.summary.successful,1);assert.equal(result.summary.failed,1);assert.equal(result.summary.skipped,8)
 assert.deepEqual(result.summary.corrections,{fixed:1,adaptive:0});assert.equal(result.summary.relativeReduction,1)
 assert.throws(()=>recordScore(session,'H01','A',{correction:true,accepted:60}));assert.throws(()=>markCase(session,'H03',{status:'ready'}))
})
test('identical outputs and zero baseline do not invent an improvement',()=>{
 let {session,mapping}=lockProtocol(config())
 for(const c of session.cases){session=markCase(session,c.id,{status:'ready',detection:'1 face',identical:true});for(const label of ['A','B'])session=recordScore(session,c.id,label,{correction:false,accepted:50})}
 const result=exportResults(finalize(session),mapping);assert.equal(result.summary.identical,10);assert.equal(result.summary.relativeReduction,null);assert.deepEqual(result.summary.meanCorrections,{fixed:0,adaptive:0})
})
test('finalized local records cannot be overwritten silently',()=>{const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};saveRecord(storage,'test','s',{finalizedAt:'locked'});assert.throws(()=>saveRecord(storage,'test','s',{}))})

test('locked protocol, dataset, assignments and partial scores resist stale overwrites',async()=>{
 const {SESSIONS_KEY,MAPPINGS_KEY}=await import('../evaluation/protocol.js')
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}
 let {session,mapping}=lockProtocol(config(),()=>.1)
 saveRecord(storage,SESSIONS_KEY,session.id,session);saveRecord(storage,MAPPINGS_KEY,session.id,mapping)
 assert.throws(()=>saveRecord(storage,SESSIONS_KEY,session.id,{...session,criteria:'changed'}))
 assert.throws(()=>saveRecord(storage,MAPPINGS_KEY,session.id,{...mapping,H01:{A:'adaptive',B:'fixed'}}))
 session=markCase(session,'H01',{status:'ready',detection:'1 face'});saveRecord(storage,SESSIONS_KEY,session.id,session)
 const stale=structuredClone(session)
 session=recordScore(session,'H01','A',{correction:true,accepted:60});saveRecord(storage,SESSIONS_KEY,session.id,session)
 assert.throws(()=>saveRecord(storage,SESSIONS_KEY,session.id,stale))
})
test('explicit skips retain partial scores but exclude them from paired means',async()=>{
 const {skipCase}=await import('../evaluation/protocol.js')
 let {session,mapping}=lockProtocol(config(),()=>.1)
 session=markCase(session,'H01',{status:'ready',detection:'1 face'})
 session=recordScore(session,'H01','A',{correction:true,accepted:60})
 for(const c of session.cases)session=skipCase(session,c.id,'Synthetic mechanics: cannot complete scoring')
 const result=exportResults(finalize(session),mapping)
 assert.equal(result.cases[0].results.length,1);assert.equal(result.summary.skipped,10)
 assert.deepEqual(result.summary.corrections,{fixed:0,adaptive:0});assert.equal(result.summary.meanCorrections,null)
})
