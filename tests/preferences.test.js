import test from 'node:test'
import assert from 'node:assert/strict'
import { createPreferenceStore, PREFERENCE_KEY } from '../src/preferences.js'
import { resolveRememberedStyle } from '../src/rememberedStyle.js'
import { createImagePipeline } from '../src/imagePipeline.js'
import { facePoints, faceImage } from './faceFixtures.js'
function memory(){const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}}
const prefs={version:1,eye:70,face:40}

test('confirmed preferences save load replace and clear; unrelated storage survives',()=>{
  const storage=memory(),store=createPreferenceStore(()=>storage)
  storage.setItem('unrelated','keep');assert.equal(store.load(),null)
  assert.deepEqual(store.save(prefs),prefs);assert.deepEqual(store.load(),prefs)
  store.save({eye:20,face:0});assert.equal(store.load().eye,20)
  store.clear();assert.equal(store.load(),null);assert.equal(storage.getItem('unrelated'),'keep')
})
test('storage serializes only numerical allowlisted fields, never input portrait data',()=>{
  const storage=memory(),store=createPreferenceStore(()=>storage)
  store.save({...prefs,image:'private',pixels:new Uint8Array([1,2]),landmarks:facePoints(),mode:'adaptive',includeFace:true})
  assert.equal(storage.data.size,1)
  assert.equal(storage.getItem(PREFERENCE_KEY),' {"version":1,"eye":70,"face":40}'.trim())
})
test('invalid preferences and unavailable storage fail explicitly',()=>{
  const storage=memory(),store=createPreferenceStore(()=>storage)
  for(const eye of [NaN,Infinity,-1,101,'50',null,1.5])assert.throws(()=>store.save({eye,face:0}))
  for(const raw of ['{','null','{"version":2,"eye":10,"face":0}']){storage.setItem(PREFERENCE_KEY,raw);assert.throws(()=>store.load())}
  const unavailable=createPreferenceStore(()=>{throw new Error('unavailable')})
  assert.throws(()=>unavailable.save(prefs));assert.throws(()=>unavailable.load());assert.throws(()=>unavailable.clear())
})
test('photo replacement and active changes do not mutate confirmed preferences',()=>{
  const storage=memory(),store=createPreferenceStore(()=>storage);store.save(prefs)
  const raw=storage.getItem(PREFERENCE_KEY)
  const first=createImagePipeline(faceImage(),facePoints()),second=createImagePipeline(faceImage(640,800),facePoints(.08))
  first.render(100,100);second.render(10,0)
  assert.equal(storage.getItem(PREFERENCE_KEY),raw);assert.deepEqual(store.load(),prefs)
})
test('fixed and adaptive use unchanged saved strengths on valid new geometry; face opt-in required',()=>{
  const pipeline=createImagePipeline(faceImage(),facePoints())
  for(const mode of ['fixed','adaptive']){
    const result=resolveRememberedStyle(prefs,pipeline,mode)
    assert.deepEqual(result.applied,{eye:70,face:0})
    assert.deepEqual(resolveRememberedStyle(prefs,pipeline,mode,true).applied,{eye:70,face:40})
  }
  assert.match(resolveRememberedStyle(prefs,pipeline).notes.join(' '),/No additional strength adaptation/)
  assert.deepEqual(prefs,{version:1,eye:70,face:40})
})
test('same saved settings refit new landmarks, produce exact direct-algorithm output',()=>{
  const original=faceImage(),copy=new Uint8ClampedArray(original.data)
  const a=createImagePipeline(original,facePoints()),b=createImagePipeline(original,facePoints(.10))
  assert.notEqual(a.geometry.eyes[0].cx,b.geometry.eyes[0].cx)
  const result=resolveRememberedStyle(prefs,b,'adaptive')
  const applied=new Uint8ClampedArray(b.render(result.applied.eye,result.applied.face).data)
  const direct=createImagePipeline(original,facePoints(.10)).render(70,0)
  assert.deepEqual(applied,direct.data)
  assert.notDeepEqual(applied,a.render(70,0).data)
  assert.deepEqual(original.data,copy)
})
test('no face and invalid geometry skip safely in both modes without changing saved settings',()=>{
  for(const mode of ['fixed','adaptive']){
    assert.deepEqual(resolveRememberedStyle(prefs,null,mode,true).applied,{eye:0,face:0})
    const pipeline=createImagePipeline(faceImage(),[]),r=resolveRememberedStyle(prefs,pipeline,mode,true)
    assert.deepEqual(r.applied,{eye:0,face:0});assert.match(r.notes.join(' '),/skipped/)
    assert.deepEqual(pipeline.render(r.applied.eye,r.applied.face).data,faceImage().data)
  }
})
test('experimental opt-in belongs to application call, not stored preference or new photo',()=>{
  const p=createImagePipeline(faceImage(),facePoints())
  assert.equal(resolveRememberedStyle(prefs,p,'adaptive',true).applied.face,40)
  assert.equal(resolveRememberedStyle(prefs,p,'adaptive').applied.face,0)
  const next=createImagePipeline(faceImage(),facePoints(.1))
  assert.equal(resolveRememberedStyle(prefs,next,'fixed').applied.face,0)
})
test('both modes share mandatory face safety; reset is exact and does not clear memory',()=>{
  const storage=memory(),store=createPreferenceStore(()=>storage);store.save(prefs)
  const original=faceImage(),pristine=new Uint8ClampedArray(original.data),pipeline=createImagePipeline(original,facePoints())
  const fixed=resolveRememberedStyle(store.load(),pipeline,'fixed',true)
  const baseline=new Uint8ClampedArray(pipeline.render(fixed.applied.eye,fixed.applied.face).data)
  const adaptive=resolveRememberedStyle(store.load(),pipeline,'adaptive',true)
  assert.deepEqual(pipeline.render(adaptive.applied.eye,adaptive.applied.face).data,baseline)
  assert.deepEqual(pipeline.render(0,0).data,pristine)
  assert.deepEqual(original.data,pristine);assert.deepEqual(store.load(),prefs)
})
