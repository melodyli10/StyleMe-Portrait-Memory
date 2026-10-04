// Small, local statistical profile. No neural network, images or raw landmarks.
export const PROFILE_KEY='styleme.teaching.v1'
export const median=values=>{const a=[...values].sort((a,b)=>a-b),n=a.length;return n?(a[Math.floor((n-1)/2)]+a[Math.floor(n/2)])/2:null}
const strength=x=>x===null || (Number.isInteger(x)&&x>=0&&x<=100)
const metric=(x,min,max)=>x===null || (typeof x==='number' && Number.isFinite(x)&&x>=min&&x<=max)
function example(value) {
  if(!value || !/^[a-f0-9]{64}$/.test(value.photoId) || !strength(value.eye) || !strength(value.face) || (value.eye===null&&value.face===null)
    || !metric(value.geometry?.eyeAspect,.08,.65) || !metric(value.geometry?.faceWidthBalance,0,1))throw new Error('Invalid confirmed example.')
  return {photoId:value.photoId,eye:value.eye,face:value.face,geometry:{eyeAspect:value.geometry.eyeAspect,faceWidthBalance:value.geometry.faceWidthBalance}}
}
export function validateProfile(value) {
  if(value?.version!==1 || !Array.isArray(value.examples) || value.examples.length>5)throw new Error('Invalid teaching profile.')
  const examples=value.examples.map(example)
  if(new Set(examples.map(e=>e.photoId)).size!==examples.length)throw new Error('Duplicate teaching photo.')
  return {version:1,examples}
}
export function confirmExample(profile,value) {
  const current=validateProfile(profile||{version:1,examples:[]}),confirmed=example(value)
  const index=current.examples.findIndex(e=>e.photoId===confirmed.photoId)
  if(index>=0)current.examples[index]=confirmed
  else {if(current.examples.length===5)throw new Error('Five examples already confirmed. Clear the profile to start a new set.');current.examples.push(confirmed)}
  return current
}
export function profilePreferences(profile) {
  if(!profile?.examples.length)return null
  const preferred=key=>Math.round(median(profile.examples.map(e=>e[key]).filter(x=>x!==null))??0)
  return {version:1,eye:preferred('eye'),face:preferred('face')}
}
export function profileGeometry(pipeline) {
  const eyes=pipeline?.geometry,face=pipeline?.faceGeometry
  const aspects=!eyes?.reason && eyes?.eyes.length===2 ? eyes.eyes.map(e=>e.eyeHeight/e.eyeWidth) : []
  const eyeAspect=aspects.length===2 && aspects.every(x=>metric(x,.08,.65)) ? median(aspects) : null
  const radii=!face?.reason && face?.sides.length===2 ? face.sides.map(s=>s.curve.nodes[0].r) : []
  const faceWidthBalance=radii.length===2 && radii.every(x=>Number.isFinite(x)&&x>0) ? Math.min(...radii)/Math.max(...radii) : null
  return {eyeAspect,faceWidthBalance}
}
function fit(rows) {
  const slopes=[]
  for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++)if(Math.abs(rows[j].x-rows[i].x)>=.01)slopes.push((rows[j].y-rows[i].y)/(rows[j].x-rows[i].x))
  if(!slopes.length)return null
  const slope=median(slopes),intercept=median(rows.map(r=>r.y-slope*r.x))
  return {slope,intercept,slopes}
}
export function eyeAdaptationModel(profile) {
  const rows=(profile?.examples||[]).filter(e=>e.eye!==null && e.geometry.eyeAspect!==null).map(e=>({x:e.geometry.eyeAspect,y:e.eye}))
  const reject=reason=>({ready:false,reason})
  if(rows.length<5)return reject('Five valid eye examples are needed for a geometry-dependent rule.')
  const minX=Math.min(...rows.map(r=>r.x)),maxX=Math.max(...rows.map(r=>r.x))
  if(maxX-minX<.04 || Math.max(...rows.map(r=>r.y))-Math.min(...rows.map(r=>r.y))<10)return reject('Setup geometry or preferred strengths vary too little; using the median.')
  const model=fit(rows)
  if(!model || model.slopes.filter(s=>Math.sign(s)===Math.sign(model.slope)).length/model.slopes.length<.8)return reject('Setup examples do not show a consistent geometry/preference relationship.')
  // Leave-one-out prediction must improve over a training-only median, not
  // just fit the same observations used to estimate the slope.
  let error=0,baseline=0
  for(let i=0;i<rows.length;i++){
    const training=rows.filter((_,j)=>j!==i),m=fit(training)
    if(!m)return reject('Insufficient distinct geometry for validation.')
    error+=Math.abs(Math.max(0,Math.min(100,m.slope*rows[i].x+m.intercept))-rows[i].y)
    baseline+=Math.abs(median(training.map(r=>r.y))-rows[i].y)
  }
  error/=rows.length;baseline/=rows.length
  if(error>5 || baseline-error<2 || error>baseline*.8)return reject('Held-out setup predictions do not sufficiently improve on the median.')
  return {ready:true,...model,minX,maxX,error,baseline,minY:Math.min(...rows.map(r=>r.y)),maxY:Math.max(...rows.map(r=>r.y))}
}
export function adaptiveProfileEye(profile,pipeline) {
  const preferred=profilePreferences(profile),model=eyeAdaptationModel(profile),x=profileGeometry(pipeline).eyeAspect
  if(!model.ready)return {eye:preferred.eye,reason:model.reason}
  if(x===null || x<model.minX || x>model.maxX)return {eye:preferred.eye,reason:'New eye geometry is missing or outside the taught range; using the median without extrapolation.'}
  const predicted=Math.round(Math.max(0,model.minY,preferred.eye-20,Math.min(100,model.maxY,preferred.eye+20,model.slope*x+model.intercept)))
  return {eye:predicted,reason:`Setup-supported eye aspect rule (${x.toFixed(3)} height/width): median ${preferred.eye} → applied ${predicted}. Limited to taught strengths and ±20 slider points; not a pose/confidence estimate.`}
}
export function createProfileStore(getStorage) {
  return {
    load(){const raw=getStorage().getItem(PROFILE_KEY);return raw===null?null:validateProfile(JSON.parse(raw))},
    save(profile){const clean=validateProfile(profile);getStorage().setItem(PROFILE_KEY,JSON.stringify(clean));return clean},
    clear(){getStorage().removeItem(PROFILE_KEY)},
  }
}
