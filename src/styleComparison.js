import {createImagePipeline} from './imagePipeline.js'
import {resolveRememberedStyle} from './rememberedStyle.js'
export const pixelsEqual=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i])
// Independent scratch pipeline. Comparing never changes the active editor output.
export function compareStyles(original,landmarks,saved,profile,includeFace=false,fixedBaseline='first-example'){
 if(!original||!landmarks||!saved)throw new Error('Upload one valid portrait and save a style first.')
 const pipeline=createImagePipeline(original,landmarks)
 const outputs=['fixed','adaptive'].map(mode=>{
  const resolved=resolveRememberedStyle(saved,pipeline,mode,includeFace,profile,fixedBaseline)
  const pixels=pipeline.render(resolved.applied.eye,resolved.applied.face)
  return {...resolved,width:original.width,height:original.height,data:new Uint8ClampedArray(pixels.data)}
 })
 return {outputs,identical:pixelsEqual(outputs[0].data,outputs[1].data)}
}
