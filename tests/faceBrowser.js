import { prepareFaceGeometry, applyFaceWarp } from '../src/faceWarp.js'
import { prepareEyeGeometry } from '../src/eyeWarp.js'
import { faceContourReport } from '../src/faceDiagnostics.js'
import { loadFaceDetector, detectFaces } from '../src/faceDetection.js'
const sampleUrls=[
  'https://storage.googleapis.com/mediapipe-assets/portrait.jpg',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=90&fit=max',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000&q=90&fit=max',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&q=90&fit=max',
]
const report=document.querySelector('#report'),frame=document.querySelector('#app-frame')
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i])
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const check=(condition,text)=>{if(!condition)throw new Error(text);report.textContent+=`\nPASS: ${text}`}
let busy=false
function upload(file,doc,win){const files=new DataTransfer();files.items.add(file);doc.querySelector('#file').files=files.files;doc.querySelector('#file').dispatchEvent(new win.Event('change',{bubbles:true}))}
async function run(file) {
  if(busy)return
  busy=true
  document.querySelectorAll('button,input').forEach(e=>e.disabled=true)
  report.textContent='Running…';document.querySelector('#results').replaceChildren()
  try {
    const doc=frame.contentDocument,win=frame.contentWindow
    upload(file,doc,win)
    const deadline=performance.now()+90000
    while(!doc.querySelector('#detection-status').textContent.startsWith('One face detected')){
      if(performance.now()>deadline)throw new Error(doc.querySelector('#detection-status').textContent)
      await pause(100)
    }
    const eye=doc.querySelector('#eye-strength'),face=doc.querySelector('#face-strength'),original=doc.querySelector('#photo'),edited=doc.querySelector('#edited')
    const read=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data
    const source=new Uint8ClampedArray(read(original))
    const eyeAvailable=!eye.disabled,faceAvailable=!face.disabled
    report.textContent=`${file.name}: ${original.width} × ${original.height}\nFace status: ${doc.querySelector('#face-status').textContent}\nEye available: ${eyeAvailable}; face available: ${faceAvailable}`
    check(equal(source,read(edited)),'both zero give exact original')
    const detection=detectFaces(await loadFaceDetector(),original)
    const lm=detection.faces[0].normalizedLandmarks
    const pixels={width:original.width,height:original.height,data:source}
    const g=prepareFaceGeometry(lm,original.width,original.height,prepareEyeGeometry(lm,original.width,original.height).eyes,pixels)
    const xs=[234,454,10,152].map(i=>lm[i].x*original.width),ys=[234,454,10,152].map(i=>lm[i].y*original.height)
    const w=Math.max(...xs)-Math.min(...xs),h=Math.max(...ys)-Math.min(...ys)
    const crop={x:Math.max(0,Math.floor(Math.min(...xs)-w*.3)),y:Math.max(0,Math.floor(Math.min(...ys)-h*.12))}
    crop.width=Math.min(original.width-crop.x,Math.ceil(w*1.6));crop.height=Math.min(original.height-crop.y,Math.ceil(h*1.3))
    const show=(label,pixels)=>{
      const full=document.createElement('canvas');full.width=original.width;full.height=original.height
      full.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels),full.width,full.height),0,0)
      const figure=document.createElement('figure'),caption=document.createElement('figcaption'),canvas=document.createElement('canvas')
      caption.textContent=label;canvas.width=crop.width;canvas.height=crop.height
      canvas.getContext('2d').drawImage(full,crop.x,crop.y,crop.width,crop.height,0,0,crop.width,crop.height)
      figure.append(caption,canvas);document.querySelector('#results').append(figure)
    }
    async function render(e,f){eye.value=String(e);face.value=String(f);eye.dispatchEvent(new win.Event('input'));face.dispatchEvent(new win.Event('input'));await new Promise(resolve=>win.requestAnimationFrame(()=>win.requestAnimationFrame(resolve)));return new Uint8ClampedArray(read(edited))}
    show('Original',source)
    for(const maximum of [.025,.035,.045,.055]){
      const output={...pixels,data:new Uint8ClampedArray(source)}
      applyFaceWarp(pixels,output,g,100,maximum)
      show(`Candidate maximum ${maximum} (same original and geometry)`,output.data)
    }
    const diagnostics=document.createElement('details'),summary=document.createElement('summary'),measurements=document.createElement('pre')
    summary.textContent='Warp-derived contour measurements (not image segmentation)'
    measurements.textContent=JSON.stringify([.025,.035,.045,.055].map(maximum=>({maximum,rows:faceContourReport(g,maximum)})),null,2)
    diagnostics.append(summary,measurements);document.querySelector('#results').append(diagnostics)
    const eyes=await render(eyeAvailable?100:0,0)
    if(eyeAvailable)check(!equal(source,eyes),'eye-only changes actual pixels')
    const face50=await render(0,faceAvailable?50:0);show('Face-only 50 (or safely skipped)',face50)
    const faces=await render(0,faceAvailable?100:0);show('Face-only 100 (or safely skipped)',faces)
    if(faceAvailable)check(!equal(source,faces),'face-only changes actual pixels')
    const both=await render(eyeAvailable?100:0,faceAvailable?100:0);show('Combined 100 / 100 (available features)',both)
    check(both.every((v,i)=>v===(eyes[i]!==source[i]?eyes[i]:faces[i])),'combined matches independent disjoint feature outputs')
    check(equal(source,read(original)),'original canvas unchanged')
    await render(20,30)
    check(equal(both,await render(eyeAvailable?100:0,faceAvailable?100:0)),'repeat combination deterministic after other values')
    doc.querySelector('#reset-eye').click();await new Promise(resolve=>win.requestAnimationFrame(()=>win.requestAnimationFrame(resolve)))
    check(eye.value==='0'&&face.value==='0'&&equal(source,read(edited)),'Reset restores both strengths and exact original')
    // Queue an edit, then immediately replace the image before its animation frame.
    const blank=document.createElement('canvas');blank.width=80;blank.height=64
    blank.getContext('2d').fillStyle='#6e9caf';blank.getContext('2d').fillRect(0,0,80,64)
    const blob=await new Promise(resolve=>blank.toBlob(resolve,'image/png'))
    eye.value='100';face.value='100';face.dispatchEvent(new win.Event('input'))
    upload(new File([blob],'replacement-no-face.png',{type:'image/png'}),doc,win)
    check(eye.disabled&&face.disabled&&eye.value==='0'&&face.value==='0','replacement immediately clears both strengths and disables controls')
    const end=performance.now()+15000
    while(!doc.querySelector('#detection-status').textContent.startsWith('No face detected')){
      if(performance.now()>end)throw new Error('Replacement detection did not finish')
      await pause(50)
    }
    check(edited.width===80&&edited.height===64&&equal(read(original),read(edited)),'replacement keeps its own dimensions/pixels; no stale edit rendered')
    report.textContent+='\nComplete. Inspect fixed-scale crops above for cheek/jaw continuity, chin, mouth, eyes, hair and background. Numerical checks do not prove naturalness.'
  }catch(error){report.textContent+=`\nFAIL / BLOCKED: ${error.message}`}
  finally{busy=false;document.querySelectorAll('button,input').forEach(e=>e.disabled=false)}
}
document.querySelector('#fixture').addEventListener('change',event=>{const file=event.target.files[0];if(file)run(file)})
for(const button of document.querySelectorAll('[data-sample]'))button.addEventListener('click',async()=>{
  if(busy)return
  report.textContent='Downloading the selected public test portrait…'
  try{const response=await fetch(sampleUrls[Number(button.dataset.sample)]);if(!response.ok)throw new Error('Sample download failed');await run(new File([await response.blob()],`public-sample-${button.dataset.sample}.jpg`,{type:'image/jpeg'}))}catch(error){report.textContent=error.message}
})
