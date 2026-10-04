import { sampleBilinear } from './eyeWarp.js'

// Anatomical right/left face-oval landmarks, ordered from cheek to lower jaw.
export const FACE_LANDMARKS = {
  right: [234, 93, 132, 58, 172, 136, 150, 149],
  left: [454, 323, 361, 288, 397, 365, 379, 378],
  axis: [168, 152], mouth: [61, 291, 13, 14], nose: [1, 98, 327],
}
export const MAX_FACE_STRENGTH = 0.045 // Target up to 4.5% of mean half-width; independent sides retain conservative safe limits.
const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
const smooth = t => { t = clamp(t, 0, 1); return t*t*t*(t*(6*t-15)+10) }
// Positive smooth lower envelope: never exceeds either safety limit. Scaling
// avoids overflow. Unlike Math.min, crossing limits have matching tangents.
function softMinimum(a,b) {
  if(a<=0 || b<=0)return 0
  const low=Math.min(a,b),high=Math.max(a,b)
  return low/(1+(low/high)**32)**(1/32)
}
const lowerEnvelope=values=>values.reduce(softMinimum)

export function faceSliderToStrength(value) {
  return Number.isFinite(Number(value)) ? clamp(Number(value), 0, 100) / 100 * MAX_FACE_STRENGTH : 0
}

// Monotone cubic Hermite interpolation: smooth tangent joins without overshoot.
function makeCurve(nodes) {
  const slopes = nodes.slice(1).map((p, i) => (p.r-nodes[i].r)/(p.v-nodes[i].v))
  const tangents = nodes.map((p, i) => {
    if (i === 0) return slopes[0]
    if (i === nodes.length-1) return slopes.at(-1)
    const a=slopes[i-1], b=slopes[i]
    if (a*b <= 0) return 0
    const h0=p.v-nodes[i-1].v, h1=nodes[i+1].v-p.v
    const w0=2*h1+h0,w1=h1+2*h0
    return (w0+w1)/(w0/a+w1/b)
  })
  return { nodes, tangents }
}
export function contourRadius(curve, v) {
  const {nodes,tangents}=curve
  if(v<=nodes[0].v) return nodes[0].r
  if(v>=nodes.at(-1).v) return nodes.at(-1).r
  const i=nodes.findIndex((p,j)=>j<nodes.length-1 && v>=p.v && v<=nodes[j+1].v)
  const a=nodes[i],b=nodes[i+1],h=b.v-a.v,t=(v-a.v)/h
  return (2*t**3-3*t*t+1)*a.r+(t**3-2*t*t+t)*h*tangents[i]+(-2*t**3+3*t*t)*b.r+(t**3-t*t)*h*tangents[i+1]
}
const toLocal = (p,g) => ({u:(p.x-g.cx)*g.ux+(p.y-g.cy)*g.uy,v:(p.x-g.cx)*g.vx+(p.y-g.cy)*g.vy})
const toImage = (u,v,g) => ({x:g.cx+u*g.ux+v*g.vx,y:g.cy+u*g.uy+v*g.vy})
const fail = reason => ({ sides:[], reason, warning:null, bounds:null })

/** Plain landmark/pixel data in, geometry out. No DOM, Canvas or storage calls. */
export function prepareFaceGeometry(landmarks, width, height, eyeRegions = [], original = null) {
  const required=[...FACE_LANDMARKS.right,...FACE_LANDMARKS.left,...FACE_LANDMARKS.axis,...FACE_LANDMARKS.mouth,...FACE_LANDMARKS.nose,33,133,362,263,159,145,386,374]
  if(!Array.isArray(landmarks)||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||!required.every(i=>{
    const p=landmarks[i];return p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1
  }))return fail('Face contour landmarks are missing or invalid. Slimming is unavailable.')
  const point=i=>({x:landmarks[i].x*width,y:landmarks[i].y*height})
  const bridge=point(168),chin=point(152)
  const length=Math.hypot(chin.x-bridge.x,chin.y-bridge.y)
  if(length<30)return fail('The face is too small for a safe contour edit.')
  const g={cx:bridge.x,cy:bridge.y,vx:(chin.x-bridge.x)/length,vy:(chin.y-bridge.y)/length,width,height,length}
  g.ux=g.vy;g.uy=-g.vx
  const local=i=>toLocal(point(i),g)
  const sides=[]
  for(const [name,indices] of [['right',FACE_LANDMARKS.right],['left',FACE_LANDMARKS.left]]) {
    const sign=Math.sign(local(indices[0]).u)
    const nodes=indices.map(i=>({v:local(i).v,r:sign*local(i).u}))
    if(!sign||nodes.some((p,i)=>p.r<1||(i>0&&p.v-nodes[i-1].v<length*.002)))return fail('The cheek/jaw contour is unreliable or strongly turned. Try a more frontal portrait.')
    if(nodes.at(-1).v>=length-1)return fail('Jaw contour does not approach the detected chin in order.')
    nodes.push({v:length,r:0})
    sides.push({name,sign,curve:makeCurve(nodes)})
  }
  if(sides[0].sign===sides[1].sign)return fail('The face sides cannot be separated reliably.')
  const ratio=Math.min(sides[0].curve.nodes[0].r,sides[1].curve.nodes[0].r)/Math.max(sides[0].curve.nodes[0].r,sides[1].curve.nodes[0].r)
  // These 2D cues mix pose, expression and natural asymmetry. They do not
  // establish invalid geometry. Only attenuate; eligibility is checked below.
  // Ordinary asymmetry gets full strength. Only pronounced side imbalance
  // uses a modest, single reduction; this is not a calibrated pose estimate.
  g.riskScale=1-.30*smooth((.55-ratio)/.30)
  g.warning=g.riskScale<.999
    ? `Unequal visible cheek widths: ${Math.round(g.riskScale*100)}% of configured strength.`
    : null
  // Protect each side of the actual nose/mouth at its own vertical location.
  // A wide or offset mouth must not mask the opposite cheek or the whole jaw.
  g.featureBands=[[1,98,327],[61,291,13,14]].map(indices=>({
    low:Math.min(...indices.map(i=>local(i).v))-length*.025,
    high:Math.max(...indices.map(i=>local(i).v))+length*.025,
    extents:sides.map(side=>Math.max(length*.06,...indices.map(i=>side.sign*local(i).u+length*.035))),
  }))
  g.centralGuard=length*.06
  let eyeBottom=Math.max(...[33,133,362,263,159,145,386,374].map(i=>local(i).v))+length*.10
  for(const eye of eyeRegions)for(const x of [eye.bounds.x0,eye.bounds.x1])for(const y of [eye.bounds.y0,eye.bounds.y1])eyeBottom=Math.max(eyeBottom,toLocal({x,y},g).v+3)
  g.start=Math.max(eyeBottom,...sides.map(s=>s.curve.nodes[0].v))
  g.end=length*.97
  if(g.end-g.start<length*.28)return fail('There is too little safe cheek/jaw area below the eyes.')
  // Require bilateral space at at least one row; never enable a one-cheek edit.
  g.sides=sides
  const usable=Array.from({length:17},(_,i)=>g.start+(g.end-g.start)*(i+1)/18)
    .some(v=>sides.every(side=>contourRadius(side.curve,v)>protectedRadius(g,side,v)+1))
  if(!usable)return fail('No shared cheek/jaw space remains outside protected features.')
  const maxRadius=Math.max(...sides.flatMap(s=>s.curve.nodes.map(p=>p.r)))*1.18
  const corners=[toImage(-maxRadius,g.start,g),toImage(maxRadius,g.start,g),toImage(-maxRadius,g.end,g),toImage(maxRadius,g.end,g)]
  const bounds={x0:Math.floor(Math.min(...corners.map(p=>p.x))),x1:Math.ceil(Math.max(...corners.map(p=>p.x))),y0:Math.floor(Math.min(...corners.map(p=>p.y))),y1:Math.ceil(Math.max(...corners.map(p=>p.y)))}
  if(bounds.x0<1||bounds.y0<1||bounds.x1>=width-1||bounds.y1>=height-1)return fail('The contour is too close to the photo edge. Use an uncropped portrait.')
  g.sides=sides;g.bounds=bounds;g.reason=null
  prepareSupportFields(g)
  return g
}

// Pixel darkness cannot distinguish skin shading from hair occlusion. It does
// not change eligibility or strength. Hair/background require visual inspection.

export function protectedRadius(g,side,v) {
  const index=g.sides.indexOf(side)
  // Smooth upper envelope stays outside both protected feature bands. Their
  // zero-valued ends have zero derivatives, including at the central baseline.
  const extensions=g.featureBands.map(b=>{
    const gap=Math.max(b.low-v,0,v-b.high)
    return (b.extents[index]-g.centralGuard)*(1-smooth(gap/(g.length*.24)))
  })
  const scale=Math.max(...extensions)
  return g.centralGuard+(scale>0 ? scale*extensions.reduce((sum,x)=>sum+(x/scale)**8,0)**(1/8) : 0)
}

function jawProfile(t) {
  if(t<.22)return smooth(t/.22)
  if(t<.50)return 1-.10*smooth((t-.22)/.28)
  return .90*(1-smooth((t-.50)/.50))
}

// Arc length follows the semantic cheek-to-jaw landmarks, independently per side.
// One side budget spans the path, preventing isolated lower-jaw deformation.
function rawRow(g,side,v) {
  const r=contourRadius(side.curve,v),guard=protectedRadius(g,side,v)
  return {side,r,guard,inner:softMinimum(.38*r,Math.max(0,r-guard)),outer:.18*r}
}
function prepareSupportFields(g) {
  const count=160,step=(g.end-g.start)/count
  for(const side of g.sides){
    let arc=0,previous=null
    let nodes=Array.from({length:count+1},(_,i)=>{
      const v=g.start+i*step,row=rawRow(g,side,v)
      if(previous)arc+=Math.hypot(v-previous.v,row.r-previous.radius)
      const node={v,r:arc,radius:row.r,safe:softMinimum(row.inner,row.outer)}
      previous=node;return node
    })
    // Finish the path before it meets the protected central chin. This is
    // a semantic endpoint, not a row-wise hole in the cheek envelope.
    const chinIndex=nodes.findIndex(n=>n.v>g.start+.70*(g.end-g.start)&&n.safe<1)
    if(chinIndex>1)nodes=nodes.slice(0,chinIndex)
    arc=nodes.at(-1).r
    side.arc=makeCurve(nodes.map(n=>({v:n.v,r:n.r/arc})))
    side.support=makeCurve(nodes.map(n=>({v:n.v,r:n.safe})))
    // Independent conservative amplitude; never borrow the other side's clearance.
    side.budget=Math.min(...nodes.map(n=>{
      const envelope=jawProfile(n.r/arc)
      return envelope>1e-6 ? .23*n.safe/envelope : Infinity
    }))
    side.referenceRadius=nodes[Math.round(count*.35)].radius
  }
}
export function faceRowGeometry(g,v,strength) {
  const rows=g.sides.map(side=>rawRow(g,side,v))
  const meanRadius=rows.reduce((sum,row)=>sum+row.r,0)/rows.length
  const intended=clamp(strength,0,.055)*meanRadius*g.riskScale
  for(const row of rows){
    const side=row.side,t=contourRadius(side.arc,v)
    const target=clamp(strength,0,.055)*side.referenceRadius*g.riskScale
    const budget=side.budget*clamp(strength/MAX_FACE_STRENGTH,0,1.23)
    const coherent=softMinimum(target,budget)*jawProfile(t)
    // Local cap guards safety between the precomputed samples.
    row.amount=softMinimum(coherent,.24*softMinimum(row.inner,row.outer))
  }
  return {rows,intended,amount:Math.min(...rows.map(row=>row.amount))}
}

/** Inverse displacement is OUTWARD, so each contour moves INWARD in output.
 * Source v stays equal to destination v (no chin lift or vertical mouth shift).
 * A narrow ribbon reaches 38% of local radius inward, 18% outward. Its constant
 * center and quintic falloff avoid a seam at the silhouette or editing boundary.
 */
export function mapFacePixel(x,y,g,strength) {
  if(!g.sides.length||!strength)return {x,y}
  const {u,v}=toLocal({x,y},g)
  if(v<=g.start||v>=g.end||Math.abs(u)<=g.centralGuard)return {x,y}
  const side=g.sides.find(s=>s.sign===Math.sign(u))
  if(!side)return {x,y}
  const {rows}=faceRowGeometry(g,v,strength)
  const {r,guard,inner,outer,amount}=rows.find(row=>row.side===side)
  if(Math.abs(u)<=guard)return {x,y}
  const distance=Math.abs(u)-r,span=distance<0?inner:outer
  if(!span)return {x,y}
  const normalized=Math.abs(distance)/span
  if(normalized>=1)return {x,y}
  const weight=1-smooth((normalized-.25)/.75)
  // amount <= .24*both spans keeps target contours inside the constant core.
  // |d(displacement)/du| <= .6, so the inverse map cannot fold.
  return toImage(u+side.sign*amount*weight,v,g)
}

export function applyFaceWarp(source,output,geometry,uiValue, maximum = MAX_FACE_STRENGTH) {
  if(source.data===output.data||source.data.buffer===output.data.buffer)throw new Error('Face warp requires a separate output buffer.')
  if(source.width!==output.width||source.height!==output.height||source.data.length!==output.data.length)throw new Error('Image sizes must match.')
  if(!geometry.sides.length)return output
  // Optional bounded maximum is used only by the development comparison page.
  const strength=faceSliderToStrength(uiValue)*clamp(maximum,0,.055)/MAX_FACE_STRENGTH,b=geometry.bounds
  for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++) {
    const i=(y*source.width+x)*4
    const p=mapFacePixel(x,y,geometry,strength)
    if(!strength||Math.abs(p.x-x)+Math.abs(p.y-y)<1e-10) {
      for(let c=0;c<4;c++)output.data[i+c]=source.data[i+c]
    }else sampleBilinear(source,p.x,p.y,output.data,i)
  }
  return output
}
