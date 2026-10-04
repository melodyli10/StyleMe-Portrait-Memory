import { loadFaceDetector, detectFaces } from '../src/faceDetection.js'
import { decodePhoto } from '../src/imageUpload.js'
import { prepareEyeGeometry, applyEyeWarpStrength, sliderToStrength } from '../src/eyeWarp.js'
import { applyEyeWarpStrength as applyLegacy, mapEyePixel as legacyMap } from './legacyEyeWarp.js'
import { getEyeDetailCrop, drawEyeDetail } from '../src/eyeDetail.js'
import { analyzeEyeWarp, formatEyeDiagnostics } from '../src/eyeDiagnostics.js'
const report = document.querySelector('#report')
let run = 0

document.querySelector('#fixture').addEventListener('change', async event => {
  const file = event.target.files[0]
  if (!file) return
  const revision = ++run
  report.textContent = 'Loading portrait and model…'
  document.querySelector('#results').replaceChildren()
  try {
    const image = await decodePhoto(file)
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight
    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)
    const source = context.getImageData(0, 0, canvas.width, canvas.height)
    const detector = await loadFaceDetector()
    if (revision !== run) return
    const detection = detectFaces(detector, canvas)
    if (detection.faces.length !== 1) throw new Error('Exactly one face required')
    const landmarks = detection.faces[0].normalizedLandmarks
    const geometry = prepareEyeGeometry(landmarks, source.width, source.height)
    if (geometry.reason) throw new Error(geometry.reason)
    const crop = getEyeDetailCrop(geometry.eyes, source.width, source.height)
    report.textContent = `${source.width} × ${source.height}; fixed crop ${JSON.stringify(crop)}\n`+
      'Reported output landmarks are predictions by solving the inverse warp, not measured segmentation of edited eyes.\n'
    const comparisons = [
      { label:'Original', strength:0, apply:applyEyeWarpStrength },
      { label:'Previous maximum (fixed core)', strength:.12, apply:applyLegacy, inverse:legacyMap },
      { label:'Corrected medium · slider 50', strength:sliderToStrength(50), apply:applyEyeWarpStrength },
      { label:'Corrected maximum · slider 100', strength:sliderToStrength(100), apply:applyEyeWarpStrength },
    ]
    for (const version of comparisons) {
      const output = { width:source.width,height:source.height,data:new Uint8ClampedArray(source.data) }
      version.apply(source,output,geometry.eyes,version.strength)
      context.putImageData(new ImageData(output.data,source.width,source.height),0,0)
      const results=analyzeEyeWarp(geometry.eyes,landmarks,source.width,source.height,version.strength,version.inverse)
      const figure=document.createElement('figure'),caption=document.createElement('figcaption'),detail=document.createElement('canvas')
      caption.textContent=version.label
      drawEyeDetail(canvas,detail,crop)
      const numbers=document.createElement('pre')
      numbers.textContent=results.map(r=>`${r.eye}: predicted lid separation ${r.predictedOpeningRatio.toFixed(3)}×; width ${r.predictedWidthRatio.toFixed(3)}×`).join('\n')
      figure.append(caption,detail,numbers);document.querySelector('#results').append(figure)
      report.textContent+=`\n${version.label}, s=${version.strength}:\n`+formatEyeDiagnostics(results)+'\n'
    }
    // Debug geometry lives only on this development page, never in app images.
    context.putImageData(source,0,0)
    const debug=document.createElement('canvas')
    drawEyeDetail(canvas,debug,crop)
    const dc=debug.getContext('2d')
    const prediction=analyzeEyeWarp(geometry.eyes,landmarks,source.width,source.height,sliderToStrength(100))
    dc.lineWidth=.6
    for (const result of prediction) for (const group of ['upper','lower','corners']) for(const p of result.groups[group]) {
      dc.strokeStyle='#ff6b00';dc.beginPath();dc.moveTo(p.before.x-crop.x,p.before.y-crop.y);dc.lineTo(p.after.x-crop.x,p.after.y-crop.y);dc.stroke()
      dc.fillStyle='#00ffd0';dc.beginPath();dc.arc(p.after.x-crop.x,p.after.y-crop.y,.7,0,Math.PI*2);dc.fill()
    }
    const figure=document.createElement('figure'),caption=document.createElement('figcaption')
    caption.textContent='DEBUG ONLY: orange source→target vectors, green predicted target points (not pixel measurements)'
    figure.append(caption,debug);document.querySelector('#results').append(figure)
    report.textContent+='\nComplete. All image comparisons have identical crop/display scale. Check aperture, iris, both lids, corners, brows, bridge and surrounding skin visually.'
  } catch(error) { if(revision===run) report.textContent=error.message }
})

document.querySelector('#public-sample').addEventListener('click', async () => {
  try {
    const response=await fetch('https://storage.googleapis.com/mediapipe-assets/portrait.jpg')
    if(!response.ok) throw new Error('Sample download failed')
    const transfer=new DataTransfer()
    transfer.items.add(new File([await response.blob()],'public-test-portrait.jpg',{type:'image/jpeg'}))
    const input=document.querySelector('#fixture')
    input.files=transfer.files;input.dispatchEvent(new Event('change'))
  } catch(error) { report.textContent=error.message }
})
