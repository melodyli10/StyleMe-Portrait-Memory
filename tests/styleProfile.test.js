import test from 'node:test'
import assert from 'node:assert/strict'
import {confirmExample,profilePreferences,profileGeometry,eyeAdaptationModel,adaptiveProfileEye,createProfileStore,PROFILE_KEY} from '../src/styleProfile.js'
import {resolveRememberedStyle} from '../src/rememberedStyle.js'
import {createImagePipeline} from '../src/imagePipeline.js'
import {EYE_LANDMARKS} from '../src/eyeWarp.js'
import {facePoints,faceImage} from './faceFixtures.js'
const id=i=>i.toString(16).padStart(64,'0')
const entry=(i,x=.16+i*.04,y=80-i*10)=>({photoId:id(i),eye:y,face:20,geometry:{eyeAspect:x,faceWidthBalance:.9}})
const learned=()=>Array.from({length:5},(_,i)=>entry(i)).reduce(confirmExample,null)
function pipeline(aspect=.2){const p=facePoints();for(const e of EYE_LANDMARKS)for(const i of new Set([...e.contour,...e.upper,...e.lower]))p[i].y=(120+(p[i].y*400-120)*aspect/.25)/400;return createImagePipeline(faceImage(),p)}
test('five confirmations produce median profile, robust to one strength outlier',()=>{
  let p=null;for(let i=0;i<5;i++)p=confirmExample(p,entry(i,.2,[20,40,50,60,100][i]))
  assert.equal(p.examples.length,5);assert.deepEqual(profilePreferences(p),{version:1,eye:50,face:20})
  assert.throws(()=>confirmExample(p,entry(6)),/Five examples/)
  const updated=confirmExample(p,entry(2,.2,45));assert.equal(updated.examples.length,5);assert.equal(updated.examples[2].eye,45);assert.equal(p.examples[2].eye,50)
})
test('profile persistence allowlists confirmed data and clearing leaves unrelated memory',()=>{
  const data=new Map([['unrelated','keep']]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}
  const store=createProfileStore(()=>storage),profile=learned()
  profile.examples[0].pixels=[1,2];profile.examples[0].filename='private.jpg';profile.examples[0].geometry.landmarks=facePoints()
  store.save(profile);const saved=store.load()
  assert.equal(saved.examples.length,5);assert.ok(!data.get(PROFILE_KEY).includes('private'));assert.ok(!data.get(PROFILE_KEY).includes('pixels'));assert.ok(!data.get(PROFILE_KEY).includes('landmarks'))
  assert.deepEqual(profilePreferences(saved),{version:1,eye:60,face:20})
  store.clear();assert.equal(store.load(),null);assert.equal(data.get('unrelated'),'keep')
})
test('missing geometry does not become a false zero measurement or enable adaptation',()=>{
  let p=learned();p=confirmExample(p,{...entry(2),eye:null,geometry:{eyeAspect:null,faceWidthBalance:null}})
  assert.equal(profilePreferences(p).eye,60);assert.equal(eyeAdaptationModel(p).ready,false)
  assert.equal(profileGeometry(createImagePipeline(faceImage(),[])).eyeAspect,null)
  assert.throws(()=>confirmExample(null,{...entry(0),geometry:{eyeAspect:NaN,faceWidthBalance:1}}))
  assert.throws(()=>confirmExample(null,{...entry(0),eye:null,face:null}))
})
test('five consistent examples support a distinct adaptive strength with honest baseline',()=>{
  const p=learned(),g=pipeline(.2),median=profilePreferences(p)
  assert.equal(eyeAdaptationModel(p).ready,true)
  const fixed=resolveRememberedStyle(median,g,'fixed',false,p),adaptive=resolveRememberedStyle(median,g,'adaptive',false,p)
  assert.equal(fixed.applied.eye,60);assert.equal(adaptive.applied.eye,70)
  assert.equal(fixed.applied.face,0);assert.equal(adaptive.applied.face,0)
  const a=new Uint8ClampedArray(g.render(fixed.applied.eye,0).data),b=new Uint8ClampedArray(g.render(adaptive.applied.eye,0).data)
  assert.notDeepEqual(a,b);assert.deepEqual(g.render(0,0).data,faceImage().data)
  assert.equal(profilePreferences(p).eye,60)
})
test('insufficient, flat, contradictory or extrapolated evidence keeps median strengths',()=>{
  const p=learned();assert.equal(eyeAdaptationModel({...p,examples:p.examples.slice(0,4)}).ready,false)
  const flat={...p,examples:p.examples.map(e=>({...e,eye:50}))};assert.equal(eyeAdaptationModel(flat).ready,false)
  const noisy={...p,examples:p.examples.map((e,i)=>({...e,eye:[0,100,50,10,90][i]}))};assert.equal(eyeAdaptationModel(noisy).ready,false)
  assert.equal(adaptiveProfileEye(p,pipeline(.4)).eye,60)
  assert.equal(adaptiveProfileEye(p,pipeline(.16)).eye,80)
})
test('photo replacement, no-face, opt-in and reset do not mutate profile or original',()=>{
  const p=learned(),before=JSON.stringify(p),first=pipeline(.2),second=pipeline(.28)
  const r=resolveRememberedStyle(profilePreferences(p),second,'adaptive',false,p)
  assert.equal(r.applied.eye,50);assert.equal(r.applied.face,0)
  first.render(100,30);second.render(r.applied.eye,r.applied.face)
  assert.deepEqual(second.render(0,0).data,faceImage().data)
  assert.deepEqual(resolveRememberedStyle(profilePreferences(p),null,'adaptive',true,p).applied,{eye:0,face:0})
  assert.equal(JSON.stringify(p),before)
})
