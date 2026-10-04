import { faceContourReport } from '../src/faceDiagnostics.js'
import test from 'node:test'
import assert from 'node:assert/strict'
import { prepareFaceGeometry, applyFaceWarp, mapFacePixel, contourRadius, faceSliderToStrength, MAX_FACE_STRENGTH, FACE_LANDMARKS, faceRowGeometry, protectedRadius } from '../src/faceWarp.js'
import { prepareEyeGeometry, applyEyeWarp } from '../src/eyeWarp.js'
import { createImagePipeline } from '../src/imagePipeline.js'
import { facePoints, faceImage } from './faceFixtures.js'
const points=facePoints(),source=faceImage()
const eyes=prepareEyeGeometry(points,source.width,source.height)
const geometry=prepareFaceGeometry(points,source.width,source.height,eyes.eyes)
const copy=()=>({...source,data:new Uint8ClampedArray(source.data)})
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)

test('face geometry derives both sides and protected eyes without modifying landmarks',()=>{
  assert.equal(eyes.reason,null);assert.equal(geometry.reason,null)
  assert.equal(geometry.sides.length,2)
  const before=structuredClone(points)
  prepareFaceGeometry(points,320,400,eyes.eyes)
  assert.deepEqual(points,before)
})
test('face zero is exact; dimensions, source and outside-support pixels are preserved',()=>{
  const pristine=new Uint8ClampedArray(source.data),output=copy()
  applyFaceWarp(source,output,geometry,0)
  assert.deepEqual(output.data,pristine)
  applyFaceWarp(source,output,geometry,100)
  let changed=0
  for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++) {
    const i=(y*source.width+x)*4,p=mapFacePixel(x,y,geometry,MAX_FACE_STRENGTH)
    if(distance(p,{x,y})<1e-10)assert.deepEqual(output.data.slice(i,i+4),pristine.slice(i,i+4))
    else if(output.data[i]!==pristine[i]||output.data[i+1]!==pristine[i+1])changed++
  }
  assert.ok(changed>100)
  assert.equal(output.width,source.width);assert.equal(output.height,source.height)
  assert.ok(output.data.every(v=>Number.isInteger(v)&&v>=0&&v<=255))
  assert.deepEqual(source.data,pristine)
})
test('inverse mapping moves contour features inward, by different cheek/jaw amounts, with no vertical shift',()=>{
  const shifts=[]
  for(const side of geometry.sides)for(const t of [.30,.65,.90]) {
    const v=geometry.start+(geometry.end-geometry.start)*t,r=contourRadius(side.curve,v)
    let lo=r*.9,hi=r
    for(let n=0;n<45;n++){
      const mid=(lo+hi)/2,p=mapFacePixel(geometry.cx+side.sign*mid,geometry.cy+v,geometry,MAX_FACE_STRENGTH)
      const mapped=side.sign*(p.x-geometry.cx)
      if(mapped<r)lo=mid;else hi=mid
    }
    const target=(lo+hi)/2
    assert.ok(target<r && r-target<=r*MAX_FACE_STRENGTH+1e-8)
    const sample=mapFacePixel(geometry.cx+side.sign*target,geometry.cy+v,geometry,MAX_FACE_STRENGTH)
    assert.ok(Math.abs(sample.y-(geometry.cy+v))<1e-10)
    shifts.push(r-target)
  }
  assert.ok(shifts[0]>shifts[2]*3)
})
test('chin, mouth, nose and entire eye write rectangles stay exactly fixed by face warp',()=>{
  for(const i of [152,168,1,98,327,61,291,13,14]){
    const p={x:points[i].x*320,y:points[i].y*400}
    assert.deepEqual(mapFacePixel(p.x,p.y,geometry,MAX_FACE_STRENGTH),p)
  }
  for(const eye of eyes.eyes)for(let y=eye.bounds.y0;y<=eye.bounds.y1;y++)for(let x=eye.bounds.x0;x<=eye.bounds.x1;x++)assert.deepEqual(mapFacePixel(x,y,geometry,MAX_FACE_STRENGTH),{x,y})
})
test('row mapping is monotone and support boundaries join smoothly',()=>{
  const v=geometry.start+(geometry.end-geometry.start)*.4,y=geometry.cy+v
  let last=-Infinity
  for(let x=0;x<320;x+=.1){const p=mapFacePixel(x,y,geometry,MAX_FACE_STRENGTH);assert.ok(p.x>last);last=p.x}
  const r=contourRadius(geometry.sides[1].curve,v),boundary=geometry.cx+r*1.18,h=1e-4
  const f=x=>mapFacePixel(x,y,geometry,MAX_FACE_STRENGTH).x
  assert.ok(Math.abs(f(boundary)-boundary)<1e-9)
  assert.ok(Math.abs((f(boundary)-f(boundary-h))/h-1)<1e-5)
})
test('actual face sampling never reads out of bounds',()=>{
  let count=0
  const guarded=new Proxy(source.data,{get(target,key){
    if(/^-?\d+$/.test(String(key))){assert.ok(Number(key)>=0 && Number(key)<target.length);count++}
    return Reflect.get(target,key,target)
  }})
  applyFaceWarp({...source,data:guarded},copy(),geometry,100)
  assert.ok(count>1000)
})
test('face repeated renders and return to zero are deterministic, not cumulative',()=>{
  const output=copy();applyFaceWarp(source,output,geometry,75)
  const expected=new Uint8ClampedArray(output.data)
  for(const v of [100,20,75])applyFaceWarp(source,output,geometry,v)
  assert.deepEqual(output.data,expected)
  applyFaceWarp(source,output,geometry,0);assert.deepEqual(output.data,source.data)
})
test('invalid/cropped/crossed contour geometry safely disables face editing',()=>{
  const bad=structuredClone(points);bad[93].x=NaN
  const cropped=points.map(p=>({...p,x:p.x-.14}))
  const extreme=structuredClone(points);for(const i of FACE_LANDMARKS.left)extreme[i].x=.5-(extreme[i].x-.5)
  for(const p of [null,[],bad,cropped,extreme]){
    const g=prepareFaceGeometry(p,320,400)
    assert.ok(g.reason);assert.equal(g.sides.length,0)
    assert.deepEqual(applyFaceWarp(source,copy(),g,100).data,source.data)
  }
})
test('tilted face keeps eye support fixed and uses its local coordinate frame',()=>{
  const p=facePoints(.12),e=prepareEyeGeometry(p,320,400),g=prepareFaceGeometry(p,320,400,e.eyes)
  assert.equal(g.reason,null);assert.ok(Math.abs(g.vx)>.1)
  for(const eye of e.eyes)for(let y=eye.bounds.y0;y<=eye.bounds.y1;y++)for(let x=eye.bounds.x0;x<=eye.bounds.x1;x++)assert.deepEqual(mapFacePixel(x,y,g,MAX_FACE_STRENGTH),{x,y})
})
test('eye-only equals unchanged eye module; face-only and combined edits remain independent',()=>{
  const pipeline=createImagePipeline(source,points)
  assert.equal(pipeline.faceGeometry.reason,null)
  const eyeOnly=new Uint8ClampedArray(pipeline.render(80,0).data)
  const expected=copy();applyEyeWarp(source,expected,eyes.eyes,80)
  assert.deepEqual(eyeOnly,expected.data)
  const faceOnly=new Uint8ClampedArray(pipeline.render(0,100).data)
  assert.notDeepEqual(faceOnly,source.data)
  const combined=new Uint8ClampedArray(pipeline.render(80,100).data)
  for(let i=0;i<combined.length;i++)assert.equal(combined[i],eyeOnly[i]!==source.data[i]?eyeOnly[i]:faceOnly[i])
  for(const [eye,face] of [[0,0],[100,50],[20,100],[80,100]])pipeline.render(eye,face)
  assert.deepEqual(pipeline.output.data,combined)
  assert.deepEqual(pipeline.render(0,0).data,source.data)
})
test('new image pipeline cannot retain old buffers, geometry or editing strength',()=>{
  const first=createImagePipeline(source,points);first.render(100,100)
  const other=faceImage(640,800),second=createImagePipeline(other,points)
  assert.notEqual(second.output.data,first.output.data)
  assert.notEqual(second.faceGeometry,first.faceGeometry)
  assert.deepEqual(second.render(0,0).data,other.data)
  assert.equal(second.output.width,640)
})
test('dark contour shading does not penalize identical valid geometry',()=>{
  const image=copy()
  for(const side of geometry.sides)for(let i=0;i<12;i++){
    const v=geometry.start+(geometry.end-geometry.start)*(.12+.58*i/11),r=contourRadius(side.curve,v)
    const x=Math.round(geometry.cx+side.sign*r*.92),y=Math.round(geometry.cy+v)
    const at=(y*320+x)*4;image.data[at]=image.data[at+1]=image.data[at+2]=0
  }
  const g=prepareFaceGeometry(points,320,400,eyes.eyes,image)
  assert.equal(g.reason,null);assert.equal(g.sides.length,2)
  assert.equal(g.riskScale,geometry.riskScale);assert.equal(g.warning,geometry.warning)
  const output=copy();applyFaceWarp(source,output,g,100)
  assert.notDeepEqual(output.data,source.data)
})
test('face strength is independent, bounded and monotone; unsafe buffer alias is rejected',()=>{
  assert.equal(faceSliderToStrength(100),.045);assert.equal(faceSliderToStrength(50),.0225)
  assert.equal(faceSliderToStrength(Infinity),0);assert.equal(faceSliderToStrength(-1),0);assert.equal(faceSliderToStrength(500),.045)
  for(let i=0;i<100;i++)assert.ok(faceSliderToStrength(i+1)>faceSliderToStrength(i))
  assert.throws(()=>applyFaceWarp(source,source,geometry,100),/separate/)
})

for(const [name,sideScale,noseX] of [
  ['frontal',1,.5], ['ordinary asymmetry',.85,.53],
  ['mild three-quarter',.70,.59], ['moderate unequal sides',.50,.5],
  ['offset nose with symmetric cheeks',1,.64], ['narrow far cheek',.35,.63],
]) test(`eligibility regression: ${name} remains editable with safe output`,()=>{
  const p=structuredClone(points)
  for(const i of FACE_LANDMARKS.left)p[i].x=.5+(p[i].x-.5)*sideScale
  p[1].x=noseX
  const before=structuredClone(p),pristine=new Uint8ClampedArray(source.data)
  const pipeline=createImagePipeline(source,p),g=pipeline.faceGeometry
  assert.equal(g.reason,null)
  assert.ok(g.riskScale>=.25 && g.riskScale<=1)
  if(sideScale<.55){assert.ok(g.riskScale<1);assert.match(g.warning,/Unequal visible cheek/)}
  else assert.equal(g.riskScale,1)
  if(sideScale===1 && noseX===.5)assert.equal(g.riskScale,1)
  const nose={x:p[1].x*320,y:p[1].y*400}
  assert.deepEqual(mapFacePixel(nose.x,nose.y,g,MAX_FACE_STRENGTH),nose)
  const output=new Uint8ClampedArray(pipeline.render(0,100).data)
  assert.notDeepEqual(output,pristine)
  pipeline.render(80,50);pipeline.render(0,100)
  assert.deepEqual(pipeline.output.data,output)
  assert.deepEqual(pipeline.render(0,0).data,pristine)
  assert.deepEqual(source.data,pristine);assert.deepEqual(p,before)
  // The corrected eligibility still yields a monotone lateral inverse map.
  const y=g.cy+g.start+(g.end-g.start)*.4
  let previous=-Infinity
  for(let x=0;x<320;x+=.25){const q=mapFacePixel(x,y,g,MAX_FACE_STRENGTH);assert.ok(q.x>previous);previous=q.x}
})
test('asymmetry reduction is continuous through former rejection thresholds',()=>{
  const scale=r=>{const p=structuredClone(points);for(const i of FACE_LANDMARKS.left)p[i].x=.5+(p[i].x-.5)*r;return prepareFaceGeometry(p,320,400)}
  for(const r of [.55,.75]){
    const a=scale(r-1e-5),b=scale(r+1e-5)
    assert.equal(a.reason,null);assert.equal(b.reason,null)
    assert.ok(Math.abs(a.riskScale-b.riskScale)<.001)
  }
})

test('contour prediction has positive monotonic inward movement on both sides with subpixel residual',()=>{
  for(const angle of [0,.12]){
    const p=facePoints(angle),g=prepareFaceGeometry(p,320,400,prepareEyeGeometry(p,320,400).eyes)
    const rows=faceContourReport(g)
    assert.equal(rows.length,8)
    for(const row of rows){
      const [half,full]=row.movements
      assert.ok(half.inward>0);assert.ok(full.inward>half.inward)
      assert.ok(full.residual<1e-8)
      assert.ok(full.inward<=full.intended+1e-8)
      if(row.t===.30)assert.ok(full.inward/row.radius>.035)
    }
  }
})
test('rendered synthetic face silhouette narrows on both sides at 50 and 100',()=>{
  const image=copy();image.data.fill(0)
  for(let y=0;y<400;y++)for(let x=0;x<320;x++){
    const v=y-geometry.cy
    const l=geometry.cx-contourRadius(geometry.sides[0].curve,v)
    const r=geometry.cx+contourRadius(geometry.sides[1].curve,v)
    const i=(y*320+x)*4
    image.data[i]=image.data[i+1]=image.data[i+2]=(x>=l&&x<=r)?255:0;image.data[i+3]=255
  }
  const edges=img=>{
    const y=Math.round(geometry.cy+geometry.start+.30*(geometry.end-geometry.start))
    const xs=Array.from({length:320},(_,x)=>x).filter(x=>img.data[(y*320+x)*4]>=128)
    return [xs[0],xs.at(-1)]
  }
  const original=edges(image),result=[]
  for(const value of [50,100]){
    const output={...image,data:new Uint8ClampedArray(image.data)}
    applyFaceWarp(image,output,geometry,value);result.push(edges(output))
  }
  assert.ok(result[0][0]>original[0]);assert.ok(result[0][1]<original[1])
  assert.ok(result[1][0]>result[0][0]);assert.ok(result[1][1]<result[0][1])
})
test('all diagnostic candidates remain monotone and reach identity at outer boundary',()=>{
  for(const maximum of [.025,.035,.045,.055]){
    for(const t of [.1,.3,.5,.7,.9]){
      const y=geometry.cy+geometry.start+t*(geometry.end-geometry.start)
      const r=contourRadius(geometry.sides[1].curve,y-geometry.cy),edge=geometry.cx+r*1.18
      const q=mapFacePixel(edge,y,geometry,maximum)
      assert.ok(Math.abs(q.x-edge)<1e-9)
      const near=mapFacePixel(edge-1e-4,y,geometry,maximum)
      assert.ok(Math.abs((q.x-near.x)/1e-4-1)<1e-5)
      let prev=-Infinity
      for(let x=0;x<320;x+=.2){const q=mapFacePixel(x,y,geometry,maximum);assert.ok(q.x>prev);prev=q.x}
    }
  }
})

for(const factor of [.65,.8,1]) test(`both cheeks and lower jaw participate with asymmetric shape ${factor}`,()=>{
  const p=structuredClone(points)
  // Perspective-like compression includes features, not just a contour moved
  // on top of an unchanged mouth. This remains an explicitly synthetic case.
  for(const q of p)if(q.x>.5)q.x=.5+(q.x-.5)*factor
  const g=prepareFaceGeometry(p,320,400,prepareEyeGeometry(p,320,400).eyes)
  assert.equal(g.reason,null)
  const report=faceContourReport(g)
  for(const t of [.3,.5,.7,.9]){
    const pair=report.filter(r=>r.t===t)
    for(let level=0;level<2;level++){
      const a=pair[0].movements[level],b=pair[1].movements[level]
      assert.ok(a.inward>0 && b.inward>0,`both sides participate at ${t}`)
      if(t<=.7)assert.ok(Math.min(a.inward,b.inward)/Math.max(a.inward,b.inward)>.35,'both independent cheek fields remain meaningful; chin endpoints may differ')
      if(factor===1)assert.ok(Math.abs(a.inward-b.inward)<1e-8,'symmetric geometry remains symmetric')
      assert.ok(a.residual<1e-8 && b.residual<1e-8)
      if(t===.3 || t===.7)assert.ok(a.inward>.15,'non-negligible cheek/jaw movement')
    }
  }
  for(const i of [1,98,327,61,291,13,14,152]){
    const q={x:p[i].x*320,y:p[i].y*400}
    assert.deepEqual(mapFacePixel(q.x,q.y,g,MAX_FACE_STRENGTH),q)
  }
})
test('jaw continues below the former cutoff and fades smoothly before chin',()=>{
  const v=geometry.length*.915
  const side=geometry.sides[0],r=contourRadius(side.curve,v)
  const p={x:geometry.cx+side.sign*r,y:geometry.cy+v}
  assert.ok(distance(mapFacePixel(p.x,p.y,geometry,MAX_FACE_STRENGTH),p)>.01)
  const edge=geometry.end,h=1e-3
  const at=v=>{const r=contourRadius(side.curve,v);const p={x:geometry.cx+side.sign*r,y:geometry.cy+v};return distance(mapFacePixel(p.x,p.y,geometry,MAX_FACE_STRENGTH),p)}
  assert.equal(at(edge),0);assert.ok(at(edge-h)/h<1e-5)
})


test('wide-mouth regression has matching displacement slopes at the former hard-limit switches',()=>{
  const p=facePoints();p[291].x=.72
  const g=prepareFaceGeometry(p,320,400)
  assert.equal(g.reason,null)
  // These roots were solved from intended == old hard ribbon cap on this
  // fixture. Old left/right slope jumps were 0.04124 and 0.06778 px/px.
  for(const v of [129.15123191445468,131.4698580173226]){
    const f=y=>faceRowGeometry(g,y,.0225).amount,h=1e-5
    const slopeJump=Math.abs((f(v+h)-f(v))/h-(f(v)-f(v-h))/h)
    assert.ok(slopeJump<1e-4,`no kink at old switch ${v}: ${slopeJump}`)
    for(const side of g.sides){
      const r=contourRadius(side.curve,v),amount=faceRowGeometry(g,v,.0225).rows.find(row=>row.side===side).amount
      const target={x:g.cx+side.sign*(r-amount),y:g.cy+v}
      const mapped=mapFacePixel(target.x,target.y,g,.0225)
      assert.ok(Math.abs(mapped.x-(g.cx+side.sign*r))<1e-8)
    }
  }
})
test('smooth limits remain within both ribbons and protect features across the full contour',()=>{
  for(const factor of [.65,1]){
    const p=facePoints();for(const q of p)if(q.x>.5)q.x=.5+(q.x-.5)*factor
    const g=prepareFaceGeometry(p,320,400)
    for(let v=g.start+.01;v<g.end;v+=.25)for(const strength of [0,.0225,.045,.055]){
      const row=faceRowGeometry(g,v,strength)
      assert.ok(Number.isFinite(row.amount) && row.amount>=0)
      assert.ok(row.amount<=row.intended+1e-10)
      for(const r of row.rows){
        assert.ok(row.amount<=.24*Math.min(r.inner,r.outer)+1e-10)
        assert.ok(r.inner<=.38*r.r+1e-10)
        assert.ok(r.inner<=Math.max(0,r.r-r.guard)+1e-10)
        const q={x:g.cx+r.side.sign*r.guard,y:g.cy+v}
        assert.deepEqual(mapFacePixel(q.x,q.y,g,strength),q)
      }
    }
  }
})
test('cheek jaw and chin displacement has continuous tangents on both sides',()=>{
  for(const mouthX of [.59,.72]){
    const p=facePoints();p[291].x=mouthX
    const g=prepareFaceGeometry(p,320,400),span=g.end-g.start
    const sites=[g.start,g.end,g.start+.25*span,g.start+.72*span,
      ...g.sides.flatMap(side=>side.curve.nodes.map(n=>n.v)),
      ...g.featureBands.flatMap(b=>[b.low-g.length*.16,b.low,b.high,b.high+g.length*.16])]
    for(let v=g.start;v<g.end;v+=.2)sites.push(v)
    for(const strength of [.0225,.045])for(const v of sites){
      if(v<g.start || v>g.end)continue
      const f=y=>y<=g.start||y>=g.end?0:faceRowGeometry(g,y,strength).amount
      const h=1e-5,jump=Math.abs((f(v+h)-f(v))/h-(f(v)-f(v-h))/h)
      assert.ok(jump<1e-4,`continuous inward displacement tangent at ${v}: ${jump}`)
      // Same field subtracts from each independent C1 contour radius; this
      // verifies tangent joins on the actual left/right destination curves.
      for(const side of g.sides){
        // Outside the measured contour domain, contourRadius uses constant
        // extrapolation; only the edit (checked above) must join identity there.
        if(v-h<=side.curve.nodes[0].v)continue
        const target=y=>contourRadius(side.curve,y)-f(y)
        const kink=Math.abs((target(v+h)-target(v))/h-(target(v)-target(v-h))/h)
        assert.ok(kink<1e-4,`continuous ${side.name} target contour at ${v}`)
      }
    }
  }
})

test('broadened cheek onset and mouth release remain tangent-continuous at maximum strength',()=>{
 const p=facePoints();p[291].x=.72
 const g=prepareFaceGeometry(p,320,400),span=g.end-g.start
 const sites=[g.start+.32*span,...g.featureBands.flatMap(b=>[b.low-g.length*.24,b.high+g.length*.24])]
 for(const v of sites){if(v<=g.start||v>=g.end)continue;const h=1e-5,f=y=>faceRowGeometry(g,y,MAX_FACE_STRENGTH).amount
 assert.ok(Math.abs((f(v+h)-f(v))/h-(f(v)-f(v-h))/h)<1e-4)
 }
})

// This regression tests the actual independently sampled fields, not their summary.
test('independent posed support fields have finite C1 joins and bounded displacement at every strength',()=>{
 const p=facePoints();for(const q of p)if(q.x>.5)q.x=.5+(q.x-.5)*.55
 const g=prepareFaceGeometry(p,320,400)
 for(const side of g.sides)for(const level of [0,25,50,75,96,100]){
  const strength=faceSliderToStrength(level)
  const f=v=>faceRowGeometry(g,v,strength).rows.find(r=>r.side===side).amount
  for(const node of side.support.nodes.slice(1,-1)){
   const h=1e-5,v=node.v
   assert.ok(Math.abs((f(v+h)-f(v))/h-(f(v)-f(v-h))/h)<1e-4)
  }
  for(let v=g.start+.1;v<g.end;v+=.5){
   const row=faceRowGeometry(g,v,strength).rows.find(r=>r.side===side)
   assert.ok(Number.isFinite(row.amount));assert.ok(row.amount<=.24*Math.min(row.inner,row.outer)+1e-10)
  }
 }
})


test('compressed semantic cheek remains continuous through middle cheek at every requested strength',()=>{
 const p=structuredClone(points)
 for(const q of p)if(q.x>.5)q.x=.5+(q.x-.5)*.65
 const g=prepareFaceGeometry(p,320,400,prepareEyeGeometry(p,320,400).eyes)
 for(const level of [0,25,50,75,96,100])for(const side of g.sides){
  const amounts=[]
  for(let i=0;i<=50;i++){
   const v=g.start+(.2+i*.01)*(g.end-g.start)
   const row=faceRowGeometry(g,v,faceSliderToStrength(level)).rows.find(r=>r.side===side)
   amounts.push(row.amount)
   assert.ok(Number.isFinite(row.amount))
   if(level===0)assert.equal(row.amount,0)
   else assert.ok(row.amount>.15*level/100,'upper/middle/lower cheek all participate')
  }
  if(level)assert.ok(Math.min(...amounts)/Math.max(...amounts)>.45,'no isolated middle-cheek trough')
 }
})
