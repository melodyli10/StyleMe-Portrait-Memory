import { contourRadius, mapFacePixel, faceRowGeometry, protectedRadius, MAX_FACE_STRENGTH } from './faceWarp.js'

// Forward contour position is solved from the inverse sampling map. These are
// predictions for landmark-derived contours, NOT segmentation of edited pixels.
export function faceContourReport(g, maximum = MAX_FACE_STRENGTH) {
  if(g.reason || !g.sides.length) return []
  const image=(u,v)=>({x:g.cx+u*g.ux+v*g.vx,y:g.cy+u*g.uy+v*g.vy})
  return g.sides.flatMap(side=>[.30,.50,.70,.90].map(t=>{
    const v=g.start+t*(g.end-g.start),r=contourRadius(side.curve,v)
    const original=image(side.sign*r,v)
    const movements=[50,100].map(value=>{
      const strength=maximum*value/100
      const intended=faceRowGeometry(g,v,strength).intended
      let lo=Math.max(0,protectedRadius(g,side,v)),hi=r
      if(lo>=hi)return {value,intended,inward:0,target:original,residual:0}
      for(let i=0;i<50;i++){
        const mid=(lo+hi)/2,p=image(side.sign*mid,v)
        const q=mapFacePixel(p.x,p.y,g,strength)
        const sourceRadius=side.sign*((q.x-g.cx)*g.ux+(q.y-g.cy)*g.uy)
        if(sourceRadius<r)lo=mid;else hi=mid
      }
      const target=image(side.sign*(lo+hi)/2,v),q=mapFacePixel(target.x,target.y,g,strength)
      return {value,intended,inward:r-(lo+hi)/2,target,residual:Math.hypot(q.x-original.x,q.y-original.y)}
    })
    return {side:side.name,t,original,radius:r,movements}
  }))
}
