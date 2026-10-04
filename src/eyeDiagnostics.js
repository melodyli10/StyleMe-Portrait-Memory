import { EYE_LANDMARKS, mapEyePixel, eyeRadius } from './eyeWarp.js'

// Forward position of a source feature, solved from the inverse pixel sampler.
// Both maps preserve rays from the center. This is a prediction of the warp,
// NOT a second detection or segmentation measurement on the edited photograph.
export function predictFeaturePosition(point, eye, strength, inverseMap = mapEyePixel) {
  const radius = eyeRadius(point.x, point.y, eye)
  if (!strength || radius === 0 || radius >= 1) return { ...point }
  let low = 1, high = 1 / radius
  for (let i = 0; i < 40; i++) {
    const factor = (low + high) / 2
    const destination = { x: eye.cx + (point.x-eye.cx)*factor, y: eye.cy+(point.y-eye.cy)*factor }
    const source = inverseMap(destination.x, destination.y, eye, strength)
    if (Math.hypot(source.x-eye.cx,source.y-eye.cy) < Math.hypot(point.x-eye.cx,point.y-eye.cy)) low=factor
    else high=factor
  }
  const factor=(low+high)/2
  return { x:eye.cx+(point.x-eye.cx)*factor,y:eye.cy+(point.y-eye.cy)*factor }
}

export function analyzeEyeWarp(eyes, landmarks, width, height, strength, inverseMap = mapEyePixel) {
  return eyes.map(eye => {
    const indices=EYE_LANDMARKS.find(item=>item.name===eye.name)
    const groups={}
    for (const group of ['upper','lower','corners','brow']) {
      groups[group]=indices[group].map(index=>{
        const before={x:landmarks[index].x*width,y:landmarks[index].y*height}
        const after=predictFeaturePosition(before,eye,strength,inverseMap)
        const dx=after.x-before.x,dy=after.y-before.y
        return {index,before,after,dx,dy,normalDisplacement:-dx*eye.uy+dy*eye.ux,displacement:Math.hypot(dx,dy)}
      })
    }
    const normal=p=>-(p.x-eye.cx)*eye.uy+(p.y-eye.cy)*eye.ux
    const heights=['before','after'].map(when=>groups.upper.reduce((sum,p,i)=>sum+Math.abs(normal(groups.lower[i][when])-normal(p[when])),0)/groups.upper.length)
    const widths=['before','after'].map(when=>Math.hypot(groups.corners[0][when].x-groups.corners[1][when].x,groups.corners[0][when].y-groups.corners[1][when].y))
    return {eye:eye.name,expectedUniformScale:1+strength,center:{x:eye.cx,y:eye.cy},support:{rx:eye.rx,ry:eye.ry},meanLidSeparationBefore:heights[0],predictedMeanLidSeparation:heights[1],predictedOpeningRatio:heights[1]/heights[0],cornerWidthBefore:widths[0],predictedCornerWidth:widths[1],predictedWidthRatio:widths[1]/widths[0],groups}
  })
}

export function formatEyeDiagnostics(results) {
  const n=value=>value.toFixed(3)
  return results.map(r=>`${r.eye.toUpperCase()} eye: intended uniform scale ${n(r.expectedUniformScale)}×; center (${n(r.center.x)}, ${n(r.center.y)}); support (${n(r.support.rx)}, ${n(r.support.ry)}) px\n`+
    `  Landmark lid separation ${n(r.meanLidSeparationBefore)} → predicted ${n(r.predictedMeanLidSeparation)} px (${n(r.predictedOpeningRatio)}×)\n`+
    `  Corner width ${n(r.cornerWidthBefore)} → predicted ${n(r.predictedCornerWidth)} px (${n(r.predictedWidthRatio)}×)\n`+
    Object.entries(r.groups).map(([group,points])=>`  ${group}: `+points.map(p=>`#${p.index} Δ(${n(p.dx)},${n(p.dy)}), normal ${n(p.normalDisplacement)} px`).join('; ')).join('\n')).join('\n')
}
