import test from 'node:test'
import assert from 'node:assert/strict'
import { EYE_LANDMARKS, prepareEyeGeometry, eyeRadius, mapEyePixel, sampleBilinear, sliderToStrength, applyEyeWarp, applyEyeWarpStrength, MAX_EYE_STRENGTH } from '../src/eyeWarp.js'
import { predictFeaturePosition, analyzeEyeWarp } from '../src/eyeDiagnostics.js'
import { getEyeDetailCrop } from '../src/eyeDetail.js'
import { createImagePipeline } from '../src/imagePipeline.js'

function syntheticImage(width = 160, height = 120) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4
    data.set([(x * 13 + y * 3) % 256, (y * 17) % 256, ((x + y) % 9) * 28, 255], i)
  }
  return { width, height, data }
}
function landmarks(width = 160, height = 120, angle = 0) {
  const result = Array.from({ length: 478 }, () => ({ x: .5, y: .5, z: 0 }))
  const c = Math.cos(angle), s = Math.sin(angle)
  EYE_LANDMARKS.forEach((eye, i) => {
    const centerX = i === 0 ? 45 : 110, centerY = 55
    const point = (index, x, y) => { result[index] = { x: (centerX + x * c - y * s) / width, y: (centerY + x * s + y * c) / height, z: 0 } }
    eye.contour.forEach((index,j) => point(index, -12*Math.cos(j*Math.PI/8), 3*Math.sin(j*Math.PI/8)))
    point(eye.iris[0], 0, 0)
    eye.iris.slice(1).forEach((index,j) => point(index, 3*Math.cos(j*Math.PI/2), 3*Math.sin(j*Math.PI/2)))
    point(eye.corners[0], -12, 0); point(eye.corners[1], 12, 0)
    eye.upper.forEach((index, j) => point(index, (j - 1) * 5, -3))
    eye.lower.forEach((index, j) => point(index, (j - 1) * 5, 3))
    eye.brow.forEach((index, j) => point(index, (j - 1) * 5, -15))
  })
  return result
}
const original = syntheticImage()
const points = landmarks()

 test('zero is pixel-identical, separate buffer, same dimensions', () => {
  const pipeline = createImagePipeline(original, points)
  const result = pipeline.render(0)
  assert.equal(result.width, original.width)
  assert.equal(result.height, original.height)
  assert.notEqual(result.data, original.data)
  assert.deepEqual(result.data, original.data)
})

test('nonzero changes both eye regions and leaves every exterior pixel untouched', () => {
  const pipeline = createImagePipeline(original, points)
  assert.equal(pipeline.geometry.reason, null)
  const output = pipeline.render(100)
  const changes = [0, 0]
  for (let y = 0; y < original.height; y++) for (let x = 0; x < original.width; x++) {
    const index = (y * original.width + x) * 4
    const eye = pipeline.geometry.eyes.findIndex(e => eyeRadius(x, y, e) < 1)
    const different = output.data.slice(index, index + 4).some((v, c) => v !== original.data[index + c])
    if (eye === -1) assert.equal(different, false)
    else if (different) changes[eye]++
  }
  assert.ok(changes.every(count => count > 50))
  assert.ok(output.data.every(value => Number.isInteger(value) && value >= 0 && value <= 255))
  for (let i = 3; i < output.data.length; i += 4) assert.equal(output.data[i], 255)
})

test('0 → 50 → 20 → 0 restores exact original without mutating source', () => {
  const before = new Uint8ClampedArray(original.data)
  const pipeline = createImagePipeline(original, points)
  for (const strength of [0, 50, 20, 0]) pipeline.render(strength)
  assert.deepEqual(pipeline.output.data, before)
  assert.deepEqual(original.data, before)
})

test('repeated strengths and new pipelines produce deterministic results', () => {
  const pipeline = createImagePipeline(original, points)
  const expected = new Uint8ClampedArray(pipeline.render(65).data)
  for (const value of [100, 1, 80, 65]) pipeline.render(value)
  assert.deepEqual(pipeline.output.data, expected)
  assert.deepEqual(createImagePipeline(original, points).render(65).data, expected)
})

test('all sampled array accesses are within source bounds during actual warp', () => {
  let reads = 0
  const guarded = new Proxy(original.data, { get(target, property) {
    if (/^-?\d+$/.test(String(property))) {
      assert.ok(Number(property) >= 0 && Number(property) < target.length)
      reads++
    }
    return Reflect.get(target, property, target)
  } })
  const output = syntheticImage()
  const eyes = prepareEyeGeometry(points, original.width, original.height).eyes
  applyEyeWarp({ ...original, data: guarded }, output, eyes, 100)
  assert.ok(reads > 1000)
})

test('bilinear sampling clamps corners, fractional edges, and external coordinates', () => {
  const source = { width: 2, height: 2, data: new Uint8ClampedArray([0,0,0,255, 100,0,0,255, 0,100,0,255, 100,100,0,255]) }
  const output = new Uint8ClampedArray(4)
  sampleBilinear(source, .5, .5, output, 0)
  assert.deepEqual([...output], [50, 50, 0, 255])
  sampleBilinear(source, -20, -10, output, 0)
  assert.deepEqual([...output], [0, 0, 0, 255])
  sampleBilinear(source, 20, 10, output, 0)
  assert.deepEqual([...output], [100, 100, 0, 255])
  sampleBilinear(source, 1, .5, output, 0)
  assert.deepEqual([...output], [100, 50, 0, 255])
})

test('transparent pixels use premultiplied alpha, avoiding dark fringes', () => {
  const source = { width: 2, height: 1, data: new Uint8ClampedArray([255,0,0,255, 0,0,0,0]) }
  const output = new Uint8ClampedArray(4)
  sampleBilinear(source, .5, 0, output, 0)
  assert.deepEqual([...output], [255, 0, 0, 128])
  sampleBilinear(source, 1, 0, output, 0)
  assert.deepEqual([...output], [0, 0, 0, 0])
})

test('invalid/missing/nonfinite/outside landmarks safely skip transformation', () => {
  for (const value of [null, undefined, [], {}, points.map((p, i) => i === 33 ? {x: NaN, y: .5} : p), points.map((p, i) => i === 386 ? {x: 2, y: .5} : p)]) {
    const pipeline = createImagePipeline(original, value)
    assert.ok(pipeline.geometry.reason)
    assert.deepEqual(pipeline.render(100).data, original.data)
  }
})

test('closed eyes, overlapping geometry and cropped eye regions are disabled', () => {
  const closed = structuredClone(points)
  EYE_LANDMARKS.forEach(eye => eye.lower.forEach((index, j) => { closed[index] = closed[eye.upper[j]] }))
  const overlap = structuredClone(points)
  const right = EYE_LANDMARKS[0], left = EYE_LANDMARKS[1]
  for (const group of ['corners', 'upper', 'lower', 'brow']) left[group].forEach((index, j) => { overlap[index] = points[right[group][j]] })
  const cropped = points.map(p => ({ ...p, x: p.x - 30 / 160 }))
  for (const value of [closed, overlap, cropped]) assert.ok(prepareEyeGeometry(value, 160, 120).reason)
})

test('rotated and translated eyes have valid non-overlapping regions', () => {
  const geometry = prepareEyeGeometry(landmarks(160, 120, .3), 160, 120)
  assert.equal(geometry.reason, null)
  assert.ok(geometry.eyes.every(eye => Math.abs(eye.uy) > .2))
  const scaled = prepareEyeGeometry(points, 1320, 1320)
  assert.equal(scaled.reason, null)
  assert.equal(scaled.eyes[0].cx / 1320, prepareEyeGeometry(points, 160, 120).eyes[0].cx / 160)
})

test('inverse mapping is identity at boundary and monotone without folding', () => {
  const eye = prepareEyeGeometry(points, 160, 120).eyes[0]
  let previous = -1
  for (let step = 0; step <= 1000; step++) {
    const r = step / 1000
    const x = eye.cx + eye.rx * r
    const mapped = mapEyePixel(x, eye.cy, eye, MAX_EYE_STRENGTH)
    const distance = mapped.x - eye.cx
    assert.ok(distance > previous)
    previous = distance
  }
  const boundaryX = eye.cx + eye.rx
  assert.deepEqual(mapEyePixel(boundaryX, eye.cy, eye, MAX_EYE_STRENGTH), { x: boundaryX, y: eye.cy })
  const near = mapEyePixel(boundaryX - .001, eye.cy, eye, MAX_EYE_STRENGTH)
  assert.ok(Math.abs(near.x - (boundaryX - .001)) < 1e-8)
})

test('slider strength is conservative, clamped, and invalid values mean zero', () => {
  assert.equal(sliderToStrength(0), 0)
  assert.equal(sliderToStrength(50), .0675)
  assert.equal(sliderToStrength(100), .12)
  assert.equal(sliderToStrength(900), .12)
  assert.equal(sliderToStrength(-10), 0)
  assert.equal(sliderToStrength(NaN), 0)
})

test('source/output aliasing is rejected before any write', () => {
  assert.throws(() => applyEyeWarp(original, original, [], 100), /separate output/)
})

test('1320 × 1320 output retains resolution and pristine pixels across many adjustments', () => {
  const source = syntheticImage(1320, 1320)
  const before = new Uint8ClampedArray(source.data)
  const pipeline = createImagePipeline(source, points)
  assert.equal(pipeline.geometry.reason, null)
  for (const value of [25, 50, 100, 75, 20]) pipeline.render(value)
  assert.equal(pipeline.output.width, 1320)
  assert.equal(pipeline.output.height, 1320)
  assert.notDeepEqual(pipeline.output.data, before)
  assert.deepEqual(source.data, before)
  assert.deepEqual(pipeline.render(0).data, before)
})


test('strength mapping is smooth, strictly monotonic, and bounded', () => {
  let previous = 0
  let previousStep = null
  for (let i = 1; i <= 10000; i++) {
    const strength = sliderToStrength(i / 100)
    const step = strength - previous
    assert.ok(step > 0 && step <= .0000151)
    assert.ok(strength <= MAX_EYE_STRENGTH)
    if (previousStep !== null) assert.ok(Math.abs(step - previousStep) < 1e-8)
    previousStep = step; previous = strength
  }
  assert.equal(previous, MAX_EYE_STRENGTH)
})

test('detail crop covers both supports, stays in bounds, and does not depend on strength', () => {
  const pipeline = createImagePipeline(original, points)
  const crop = getEyeDetailCrop(pipeline.geometry.eyes, original.width, original.height)
  assert.ok(crop.x >= 0 && crop.y >= 0)
  assert.ok(crop.x + crop.width <= original.width && crop.y + crop.height <= original.height)
  for (const eye of pipeline.geometry.eyes) {
    assert.ok(crop.x <= eye.bounds.x0 && crop.y <= eye.bounds.y0)
    assert.ok(crop.x + crop.width > eye.bounds.x1 && crop.y + crop.height > eye.bounds.y1)
  }
  for (const strength of [0, 50, 100, 0]) {
    pipeline.render(strength)
    assert.deepEqual(getEyeDetailCrop(pipeline.geometry.eyes, original.width, original.height), crop)
  }
  assert.equal(getEyeDetailCrop([], 160, 120), null)
})

test('all candidate strengths use fixed supports and preserve original/exterior pixels', () => {
  const source = syntheticImage()
  const before = new Uint8ClampedArray(source.data)
  const eyes = prepareEyeGeometry(points, source.width, source.height).eyes
  for (const strength of [.10, .12, .14]) {
    const output = { ...source, data: new Uint8ClampedArray(source.data) }
    applyEyeWarpStrength(source, output, eyes, strength)
    assert.notDeepEqual(output.data, before)
    assert.deepEqual(source.data, before)
    for (let y=0;y<source.height;y++) for (let x=0;x<source.width;x++) {
      if (eyes.some(eye=>eyeRadius(x,y,eye)<1)) continue
      const i=(y*source.width+x)*4
      assert.deepEqual(output.data.slice(i,i+4), before.slice(i,i+4))
    }
  }
})


test('every detected eye-contour feature receives the specified uniform enlargement in both eyes', () => {
  const geometry=prepareEyeGeometry(points,160,120)
  for(const strength of [sliderToStrength(50),MAX_EYE_STRENGTH,.14]) for(const eye of geometry.eyes) {
    for(const p of eye.featurePoints) {
      const target={x:eye.cx+(p.x-eye.cx)*(1+strength),y:eye.cy+(p.y-eye.cy)*(1+strength)}
      assert.ok(eyeRadius(target.x,target.y,eye)<eye.coreRadius)
      const source=mapEyePixel(target.x,target.y,eye,strength)
      assert.ok(Math.hypot(source.x-p.x,source.y-p.y)<1e-10)
      const predicted=predictFeaturePosition(p,eye,strength)
      assert.ok(Math.hypot(predicted.x-target.x,predicted.y-target.y)<1e-8)
    }
  }
})

test('upper/lower lid separation and corner width expand, without changing aspect ratio', () => {
  const geometry=prepareEyeGeometry(points,160,120)
  for(const strength of [.0675,.12]) {
    const diagnostic=analyzeEyeWarp(geometry.eyes,points,160,120,strength)
    for(const eye of diagnostic) {
      assert.ok(Math.abs(eye.predictedOpeningRatio-(1+strength))<1e-9)
      assert.ok(Math.abs(eye.predictedWidthRatio-(1+strength))<1e-9)
      assert.ok(eye.groups.upper.every(p=>p.normalDisplacement<0))
      assert.ok(eye.groups.lower.every(p=>p.normalDisplacement>0))
      assert.ok(eye.groups.brow.every(p=>p.displacement===0))
    }
  }
})

test('iris pairwise distances scale uniformly: no anisotropic pupil/iris stretch in core', () => {
  const eyes=prepareEyeGeometry(points,160,120).eyes
  eyes.forEach((eye,i)=>{
    const iris=EYE_LANDMARKS[i].iris.map(index=>({x:points[index].x*160,y:points[index].y*120}))
    const moved=iris.map(p=>predictFeaturePosition(p,eye,.12))
    for(let a=0;a<iris.length;a++)for(let b=a+1;b<iris.length;b++) {
      const before=Math.hypot(iris[a].x-iris[b].x,iris[a].y-iris[b].y)
      const after=Math.hypot(moved[a].x-moved[b].x,moved[a].y-moved[b].y)
      assert.ok(Math.abs(after/before-1.12)<1e-9)
    }
  })
})

test('fitted transition is continuous with matching first derivatives at core and exterior', () => {
  const eye=prepareEyeGeometry(points,160,120).eyes[0]
  const h=1e-5
  const f=r=>mapEyePixel(eye.cx+eye.rx*r,eye.cy,eye,.12).x
  for(const boundary of [eye.coreRadius,1]) {
    const left=(f(boundary)-f(boundary-h))/h
    const right=(f(boundary+h)-f(boundary))/h
    assert.ok(Math.abs(left-right)<1e-5)
  }
})

test('unexpected full-contour points and nose-bridge overlap fail safely', () => {
  const bad=structuredClone(points);bad[246]={x:.5,y:.5}
  assert.ok(prepareEyeGeometry(bad,160,120).reason)
  const nose=structuredClone(points);nose[168]=points[468]
  assert.match(prepareEyeGeometry(nose,160,120).reason,/nose bridge/)
})

test('rendered synthetic eye silhouettes actually grow in width and opening, not just nearby skin', () => {
  const width=1600,height=1200
  const source={width,height,data:new Uint8ClampedArray(width*height*4)}
  for(let i=3;i<source.data.length;i+=4)source.data[i]=255
  const eyes=prepareEyeGeometry(points,width,height).eyes
  for(const eye of eyes) {
    for(let y=Math.floor(eye.cy-35);y<=Math.ceil(eye.cy+35);y++)for(let x=Math.floor(eye.cx-125);x<=Math.ceil(eye.cx+125);x++) {
      if(((x-eye.cx)/120)**2+((y-eye.cy)/30)**2<=1) {
        const i=(y*width+x)*4;source.data[i]=source.data[i+1]=source.data[i+2]=255
      }
    }
  }
  const pristine=new Uint8ClampedArray(source.data)
  const output=createImagePipeline(source,points).render(100)
  const span=(image,eye,horizontal)=>{
    const values=[]
    for(let delta=-160;delta<=160;delta++) {
      const x=Math.round(eye.cx+(horizontal?delta:0)),y=Math.round(eye.cy+(horizontal?0:delta))
      if(image.data[(y*width+x)*4]>=128)values.push(delta)
    }
    return {min:Math.min(...values),max:Math.max(...values),size:Math.max(...values)-Math.min(...values)+1}
  }
  for(const eye of eyes)for(const horizontal of [false,true]) {
    const before=span(source,eye,horizontal),after=span(output,eye,horizontal)
    assert.ok(after.min<before.min && after.max>before.max)
    assert.ok(Math.abs(after.size-before.size*1.12)<=2, 'measured raster opening/width should follow 1.12× within rasterization tolerance')
  }
  assert.deepEqual(source.data,pristine)
})
