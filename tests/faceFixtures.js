import { EYE_LANDMARKS } from '../src/eyeWarp.js'
import { FACE_LANDMARKS } from '../src/faceWarp.js'
export function facePoints(angle=0) {
  const points=Array.from({length:478},()=>({x:.5,y:.5,z:0}))
  const set=(i,x,y)=>{
    const dx=x-160,dy=y-200
    points[i]={x:(160+dx*Math.cos(angle)-dy*Math.sin(angle))/320,y:(200+dx*Math.sin(angle)+dy*Math.cos(angle))/400,z:0}
  }
  set(168,160,140);set(152,160,340);set(6,160,160);set(1,160,210)
  set(98,146,220);set(327,174,220)
  set(61,130,260);set(291,190,260);set(13,160,257);set(14,160,264)
  const contour=[[50,170],[55,195],[60,220],[65,245],[75,270],[90,295],[110,315],[125,325]]
  for(const side of ['right','left'])FACE_LANDMARKS[side].forEach((index,i)=>set(index,side==='right'?contour[i][0]:320-contour[i][0],contour[i][1]))
  EYE_LANDMARKS.forEach((eye,i)=>{
    const cx=i?225:95,cy=120
    eye.contour.forEach((index,j)=>set(index,cx-20*Math.cos(j*Math.PI/8),cy+5*Math.sin(j*Math.PI/8)))
    eye.upper.forEach((index,j)=>set(index,cx+(j-1)*8,cy-5))
    eye.lower.forEach((index,j)=>set(index,cx+(j-1)*8,cy+5))
    eye.brow.forEach((index,j)=>set(index,cx+(j-1)*8,cy-22))
    set(eye.iris[0],cx,cy)
    eye.iris.slice(1).forEach((index,j)=>set(index,cx+4*Math.cos(j*Math.PI/2),cy+4*Math.sin(j*Math.PI/2)))
  })
  return points
}
export function faceImage(width=320,height=400) {
  const data=new Uint8ClampedArray(width*height*4)
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4
    data.set([150+(x%30),130+(y%35),110+((x+y)%25),255],i)
  }
  return {width,height,data}
}
