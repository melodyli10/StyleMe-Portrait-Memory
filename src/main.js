import {isSampleDigest} from './samplePolicy.js'
import {samples} from './samples.js'
import { mountSiteShell } from './siteShell.js'
import { createProfileStore, confirmExample, profilePreferences, profileGeometry, eyeAdaptationModel } from './styleProfile.js'
import { createPreferenceStore } from './preferences.js'
import { resolveRememberedStyle } from './rememberedStyle.js'
import { faceSliderToStrength } from './faceWarp.js'
import './style.css'
import './ux.css'
import './refinement.css'
import { loadFaceDetector, detectFaces } from './faceDetection.js'
import { decodePhoto } from './imageUpload.js'
import { getEyeDetailCrop, drawEyeDetail } from './eyeDetail.js'
import { createImagePipeline } from './imagePipeline.js'
import { showPhoto, clearLandmarks, drawLandmarks } from './preview.js'

document.querySelector('#app').innerHTML = `
  <header class="masthead"><a class="wordmark" href="./">StyleMe</a><span class="edition">A PERSONAL RETOUCH MEMORY</span></header>
  <main>
    <section class="intro"><p class="eyebrow">YOUR PORTRAIT, YOUR PREFERENCE</p><h1>Your edits, remembered.</h1><p>A thoughtful space for portraits. Start with a photo.<br>A subtle adjustment. Always your original, preserved.</p></section>
    <section class="workspace" aria-label="Portrait workspace">
      <div class="toolbar"><div><h2>Your portrait</h2><p id="photo-info">An original worth keeping.</p></div><button id="upload" type="button">Upload photo <span aria-hidden="true">↗</span></button><input id="file" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" hidden></div>
      <div class="preview" id="preview" aria-busy="false">
        <div id="empty"><div class="portrait-symbol" aria-hidden="true">＋</div><h3>A little more you.</h3><p>Choose a portrait to begin.</p><p class="formats">JPG or PNG · up to 30 MB / 24 MP</p></div>
        <div id="comparison" class="comparison" hidden>
          <figure><figcaption>ORIGINAL</figcaption><div class="canvas-stack" id="canvas-stack"><canvas id="photo" role="img" aria-label="Uploaded original portrait"></canvas><canvas id="landmarks" aria-hidden="true" hidden></canvas></div></figure>
          <figure><figcaption id="edited-caption">EDITED · EYE ENLARGEMENT 0</figcaption><div class="canvas-stack" id="edited-stack"><canvas id="edited" role="img" aria-label="Edited portrait"></canvas></div></figure>
        </div>
      </div>
      <div class="preview-footer"><label><input id="large-preview" type="checkbox"> Large previews</label><label><input id="show-landmarks" type="checkbox" disabled> Show landmarks on original</label></div>
    </section>
    <section class="edit-controls" aria-label="Portrait editing controls">
      <div class="control-heading"><label for="eye-strength">Eye Enlargement</label><output id="eye-value" for="eye-strength">0</output></div>
      <input id="eye-strength" type="range" min="0" max="100" step="1" value="0" disabled aria-describedby="edit-status">
      <div class="range-labels"><span>Original · 0</span><span>Subtle maximum · 100</span></div>
      <div class="face-control">
        <div class="control-heading"><label for="face-strength">Face Slimming</label><output id="face-value" for="face-strength">0</output></div>
        <input id="face-strength" type="range" min="0" max="100" step="1" value="0" disabled aria-describedby="face-status">
        <div class="range-labels"><span>Original · 0</span><span>Conservative maximum · 100</span></div>
        <p id="face-status" class="muted" role="status">Upload a clear single-person portrait to enable face slimming.</p>
        <p class="muted face-note">Nearby hair and background can move. Keep slimming at 0 if hair hides the cheek or jaw, and check straight lines around the face.</p>
      </div>
      <button id="reset-eye" class="secondary" type="button" disabled>Reset to Original</button>
      <p id="edit-status" role="status">Upload a clear single-person portrait to enable eye adjustment.</p>
      <section class="memory-controls" aria-label="Retouch Memory">
        <h2>Retouch Memory</h2>
        <h3>Teach StyleMe</h3><p class="muted">Confirm your choices on up to five different setup photos. A local statistical profile, not neural-network training.</p>
        <p id="teaching-progress" role="status">0/5 examples</p>
        <button id="confirm-example" class="secondary" type="button" disabled>Confirm This Setup Photo</button>
        <button id="clear-profile" class="secondary" type="button">Clear Teaching Profile</button>
        <details><summary>Review teaching profile</summary><p id="profile-review" class="muted">No confirmed examples.</p></details>
        <p id="saved-settings" class="muted">No saved preferences.</p>
        <label for="style-mode">Comparison mode</label>
        <select id="style-mode"><option value="fixed">Fixed Preset</option><option value="adaptive" selected>StyleMe Adaptive</option></select>
        <label class="memory-opt-in"><input id="include-face" type="checkbox"> Include Face Slimming for this photo</label>
        <div class="memory-actions">
          <button id="save-preferences" type="button" class="secondary" disabled>Save My Preferences</button>
          <button id="apply-preferences" type="button" class="secondary" disabled>Apply Remembered Style</button>
          <button id="clear-preferences" type="button" class="secondary">Clear Memory</button>
        </div>
        <p id="memory-status" class="muted" role="status">Only confirmed settings, compact teaching ratios and duplicate-check digests are saved locally. No images or raw landmarks. Slider changes are not saved automatically.</p>
        <p id="applied-status" class="muted" role="status">No remembered style applied.</p>
      </section>
      <section id="eye-detail" hidden aria-label="Eye Detail comparison">
        <h2>Eye Detail</h2><p class="muted">The same crop and display scale. Both eyes, genuine image pixels.</p>
        <div class="eye-detail-scroll"><div class="eye-detail-grid">
          <figure><figcaption>ORIGINAL</figcaption><canvas id="eye-original" role="img" aria-label="Original eye detail"></canvas></figure>
          <figure><figcaption id="eye-detail-caption">EDITED · 0</figcaption><canvas id="eye-edited" role="img" aria-label="Edited eye detail"></canvas></figure>
        </div></div>
      </section>
    </section>
    <section class="details" aria-label="Detection and privacy"><div><p class="eyebrow">FACE DETECTION</p><p id="model-status" role="status">Loading face model…</p><p id="detection-status" role="status" aria-live="polite">Upload a single-person portrait to begin.</p><button id="retry" class="secondary" hidden>Retry detection</button></div><div><p class="eyebrow">PRIVATE BY DESIGN</p><p>Your photo stays in this browser.</p><p class="muted">No photo uploads or saved portraits. The face model downloads from Google; detection runs on your device.</p></div></section>
    <footer>Retouch Memory <span>Confirmed preferences</span><span>Your original stays untouched.</span></footer>
  </main>`

const ui = Object.fromEntries(['upload', 'file', 'photo', 'landmarks', 'preview', 'empty', 'canvas-stack', 'photo-info', 'show-landmarks', 'model-status', 'detection-status', 'retry', 'comparison', 'edited', 'edited-stack', 'edited-caption', 'large-preview', 'eye-strength', 'eye-value', 'edit-status', 'reset-eye', 'eye-detail', 'eye-original', 'eye-edited', 'eye-detail-caption', 'face-strength', 'face-value', 'face-status', 'saved-settings', 'style-mode', 'include-face', 'save-preferences', 'apply-preferences', 'clear-preferences', 'memory-status', 'applied-status', 'teaching-progress', 'confirm-example', 'clear-profile', 'profile-review'].map(id => [id, document.getElementById(id)]))
// Private session state: original pixels are captured once, never written by edits.
const state = { image: null, original: null, detection: null, pipeline: null, editedImage: null, revision: 0, frame: null, detailCrop: null, photoId: null, isSample: false }
const preferenceStore = createPreferenceStore(() => window.localStorage)
const profileStore=createProfileStore(() => window.localStorage)
let teachingProfile=null
let savedPreferences = null
const activePreferences=()=>profilePreferences(teachingProfile)||savedPreferences
let styleApplication = null
let detectorPromise
const notifyProduct=()=>window.dispatchEvent(new Event('styleme:state'))

function updateMemoryControls() {
  const active=activePreferences()
  ui['saved-settings'].textContent = active
    ? `${teachingProfile?.examples.length?'Profile median':'Saved'}: Eye Enlargement ${active.eye} · Face Slimming ${active.face}.`
    : 'No saved preferences.'
  ui['apply-preferences'].disabled = !active || !state.pipeline || Boolean(teachingProfile?.examples.length && teachingProfile.examples.length<5)
  ui['save-preferences'].disabled = state.isSample || !state.pipeline || (ui['eye-strength'].disabled && ui['face-strength'].disabled)
  const count=teachingProfile?.examples.length||0
  const existing=teachingProfile?.examples.some(e=>e.photoId===state.photoId)
  ui['teaching-progress'].textContent=`${count}/5 confirmed examples. ${count?'The taught profile is used by Apply Remembered Style.':'Existing quick-save memory remains available.'}`
  ui['confirm-example'].disabled=ui['save-preferences'].disabled || !state.photoId || (count===5&&!existing)
  ui['confirm-example'].textContent=existing?'Update This Setup Example':'Confirm This Setup Photo'
  const model=eyeAdaptationModel(teachingProfile)
  ui['profile-review'].textContent=count
    ? teachingProfile.examples.map((e,i)=>`Example ${i+1}: eye ${e.eye??'unavailable'}, face ${e.face??'unavailable'}.`).join(' ') + ` ${model.ready?'A consistent eye-aspect rule passed setup cross-validation; effectiveness on new portraits remains unproven.':model.reason}`
    : 'No confirmed examples.'
  notifyProduct()
}
function updateAppliedStatus() {
  const eye=ui['eye-strength'].disabled?0:Number(ui['eye-strength'].value)
  const face=ui['face-strength'].disabled?0:Number(ui['face-strength'].value)
  const active=activePreferences()
  const saved=active?`Saved/profile eye ${active.eye}, face ${active.face}. `:'No saved settings. '
  ui['applied-status'].textContent = `${saved}Applied eye ${eye}, face ${face}. ${styleApplication?styleApplication.notes.join(' '):'Manual values; no remembered-style adaptation active.'}`
  notifyProduct()
}
function applyRememberedStyle() {
  const active=activePreferences()
  if(!active || (teachingProfile?.examples.length && teachingProfile.examples.length<5))return
  styleApplication=resolveRememberedStyle(active,state.pipeline,ui['style-mode'].value,true,teachingProfile)
  ui['eye-strength'].value=String(styleApplication.applied.eye)
  ui['face-strength'].value=String(styleApplication.applied.face)
  scheduleEdit()
}
try { teachingProfile=profileStore.load() }
catch { ui['memory-status'].textContent='Teaching profile could not be read. Clear Teaching Profile can remove an invalid record.' }
try { savedPreferences=preferenceStore.load() }
catch { ui['memory-status'].textContent='Saved preferences could not be read (storage unavailable or invalid record). Clear Memory can remove an invalid record; photos are unaffected.' }
updateMemoryControls()


function initializeModel() {
  ui['model-status'].textContent = 'Loading face model…'
  detectorPromise = loadFaceDetector()
  detectorPromise.then(() => {
    ui['model-status'].textContent = 'Face model ready · on-device detection'
    if (!state.image) ui.retry.hidden = true
  }).catch(error => {
    console.error('Model initialization failed:', error)
    ui['model-status'].textContent = 'Face model unavailable. Check your connection and retry.'
    ui.retry.hidden = false
  })
}

function resetEditing(message) {
  styleApplication=null
  ui['include-face'].checked=false
  if (state.frame !== null) cancelAnimationFrame(state.frame)
  state.frame = null
  state.pipeline = null
  state.detailCrop = null
  ui['eye-detail'].hidden = true
  ui['reset-eye'].disabled = true
  state.editedImage = null
  ui['eye-strength'].value = '0'
  ui['eye-strength'].disabled = true
  ui['eye-value'].value = '0'
  ui['face-strength'].value = '0'
  ui['face-strength'].disabled = true
  ui['face-value'].value = '0'
  ui['face-status'].textContent = message
  ui['edited-caption'].textContent = 'EDITED · EYE ENLARGEMENT 0'
  ui['edit-status'].textContent = message
  if (state.original) ui.edited.getContext('2d').putImageData(state.original, 0, 0)
  updateMemoryControls()
  updateAppliedStatus()
}

function prepareEditing() {
  if (state.detection?.faces.length !== 1 || !state.original) return
  state.pipeline = createImagePipeline(state.original, state.detection.faces[0].normalizedLandmarks)
  const { output, geometry, faceGeometry } = state.pipeline
  state.editedImage = new ImageData(output.data, output.width, output.height)
  if (!geometry.reason) {
    ui['eye-strength'].disabled = false
    state.detailCrop = getEyeDetailCrop(geometry.eyes, state.original.width, state.original.height)
    drawEyeDetail(ui.photo, ui['eye-original'], state.detailCrop)
    updateEyeDetail(0)
    ui['eye-detail'].hidden = false
  }
  ui['face-strength'].disabled = Boolean(faceGeometry.reason)
  ui['face-status'].textContent = faceGeometry.reason || faceGeometry.warning || 'Ready. Cheeks and lower jaw only; central features and chin are protected.'
  ui['reset-eye'].disabled = ui['eye-strength'].disabled && ui['face-strength'].disabled
  ui['edit-status'].textContent = geometry.reason || 'No active edits. Adjust either feature independently.'
  updateMemoryControls()
  updateAppliedStatus()
}

function updateEyeDetail(value) {
  if (!state.detailCrop) return
  drawEyeDetail(ui.edited, ui['eye-edited'], state.detailCrop)
  ui['eye-detail-caption'].textContent = `EDITED · ${value}`
}

function scheduleEdit() {
  ui['eye-value'].value = ui['eye-strength'].value
  ui['face-value'].value = ui['face-strength'].value
  updateAppliedStatus()
  if (state.frame !== null || !state.pipeline || (ui['eye-strength'].disabled && ui['face-strength'].disabled)) return
  const revision = state.revision
  state.frame = requestAnimationFrame(() => {
    state.frame = null
    if (revision !== state.revision || !state.pipeline || !state.editedImage) return
    try {
      const value = ui['eye-strength'].disabled ? 0 : Number(ui['eye-strength'].value)
      const faceValue = ui['face-strength'].disabled ? 0 : Number(ui['face-strength'].value)
      state.pipeline.render(value, faceValue)
      const fg=state.pipeline.faceGeometry
      if(!fg.reason) ui['face-status'].textContent = `${fg.warning || 'Full configured strength.'} Effective contour coefficient: ${(faceSliderToStrength(faceValue)*fg.riskScale*100).toFixed(2)}% of mean half-width; balanced to both sides’ safe space and tapered near the chin.`

      const context = ui.edited.getContext('2d')
      // Transfer only the changed regions to the full-resolution edited canvas.
      for (const b of state.pipeline.dirtyBounds) {
        context.putImageData(state.editedImage, 0, 0, b.x0, b.y0, b.x1 - b.x0 + 1, b.y1 - b.y0 + 1)
      }
      ui['edited-caption'].textContent = `EDITED · FACE ${faceValue} · EYE ENLARGEMENT ${value}`
      updateEyeDetail(value)
      window.dispatchEvent(new CustomEvent('styleme:rendered',{detail:{remembered:Boolean(styleApplication)}}))
      const active = [value ? `Eye Enlargement ${value}` : '', faceValue ? `Face Slimming ${faceValue}` : ''].filter(Boolean)
      ui['edit-status'].textContent = active.length ? `Active: ${active.join(' · ')}. Check the portrait and contour boundaries.` : 'Both strengths 0: exact original pixels restored.'
    } catch (error) {
      console.error('Portrait rendering failed:', error)
      resetEditing('Rendering failed. Original preserved; retry detection or use another photo.')
      ui.retry.hidden = false
    }
  })
}

async function runDetection(revision) {
  resetEditing('Detecting a face before enabling edits…')
  ui.preview.setAttribute('aria-busy', 'true')
  ui.retry.hidden = true
  ui['detection-status'].textContent = 'Preparing face detection…'
  let detector
  try {
    if (!detectorPromise) initializeModel()
    detector = await detectorPromise
  } catch {
    if (revision !== state.revision) return
    ui['detection-status'].textContent = 'Photo loaded. Detection needs the face model; check your connection and retry.'
    ui['edit-status'].textContent = 'Edits unavailable until face detection succeeds.'
    ui['face-status'].textContent = 'Face slimming needs successful face detection.'
    ui.retry.hidden = false
    ui.preview.setAttribute('aria-busy', 'false')
    return
  }
  if (revision !== state.revision) return
  try {
    ui['detection-status'].textContent = 'Detecting face landmarks…'
    await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)))
    if (revision !== state.revision) return
    state.detection = detectFaces(detector, ui.photo)
    const count = state.detection.faces.length
    drawLandmarks(ui.landmarks, state.detection)
    ui['show-landmarks'].disabled = count === 0
    ui['detection-status'].textContent = count === 0
      ? 'No face detected. Try a clear, well-lit portrait facing the camera.'
      : count > 1
        ? 'Multiple faces detected. Choose a photo with just one person for this project.'
        : `One face detected · ${state.detection.faces[0].normalizedLandmarks.length} landmarks. Original photo unchanged.`
    ui['edit-status'].textContent = count === 0
      ? 'No face detected: both edits disabled; original preserved.'
      : 'Edits require exactly one detected face.'
    ui['face-status'].textContent = count === 0 ? 'No face detected: both edits disabled; original preserved.' : 'Edits require exactly one detected face.'
    prepareEditing()
  } catch (error) {
    console.error('Face detection failed:', error)
    state.detection = null
    clearLandmarks(ui.landmarks)
    ui['show-landmarks'].disabled = true
    ui['detection-status'].textContent = 'Detection failed. Retry or choose a smaller, clearer portrait.'
    resetEditing('Eye adjustment unavailable. Original preserved.')
    ui.retry.hidden = false
  } finally {
    if (revision === state.revision) ui.preview.setAttribute('aria-busy', 'false')
  }
}

ui.upload.addEventListener('click', () => ui.file.click())
async function loadPhoto(file, sample=false) {
  if (!file) return
  const previousSample=state.isSample
  state.isSample=sample
  state.photoId=null
  const revision = ++state.revision
  resetEditing('Reading a new photo; previous edits have been cleared.')
  state.detection = null
  clearLandmarks(ui.landmarks)
  ui['show-landmarks'].disabled = true
  ui.retry.hidden = true
  ui['detection-status'].textContent = 'Reading photo…'
  ui.preview.setAttribute('aria-busy', 'true')
  try {
    const image = await decodePhoto(file)
    if (revision !== state.revision) return
    // Digest detects re-confirmation of the same file without retaining bytes
    // or filenames. Only a confirmed example persists this non-image identifier.
    const digest=await crypto.subtle.digest('SHA-256',await file.arrayBuffer())
    if(revision!==state.revision)return
    state.photoId=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')
    state.isSample=sample || isSampleDigest(state.photoId)
    showPhoto(image, ui.photo, ui.landmarks)
    // Capture the pristine buffer only after decoding and drawing a new photo.
    state.original = ui.photo.getContext('2d').getImageData(0, 0, ui.photo.width, ui.photo.height)
    state.image = image
    ui.edited.width = ui.photo.width
    ui.edited.height = ui.photo.height
    ui.edited.getContext('2d').putImageData(state.original, 0, 0)
    ui.empty.hidden = true
    ui.comparison.hidden = false
    for (const id of ['canvas-stack', 'edited-stack']) ui[id].style.maxWidth = `${image.naturalWidth}px`
    ui['photo-info'].textContent = `${file.name} · ${image.naturalWidth} × ${image.naturalHeight} px`
    ui.upload.innerHTML = 'Replace photo <span aria-hidden="true">↗</span>'
    await runDetection(revision)
  } catch (error) {
    if (revision !== state.revision) return
    state.isSample=previousSample
    // If drawing failed after a valid decode, restore the prior original as well.
    if (state.original) {
      ui.photo.width = state.original.width
      ui.photo.height = state.original.height
      ui.photo.getContext('2d').putImageData(state.original, 0, 0)
      ui.landmarks.width = state.original.width
      ui.landmarks.height = state.original.height
    }
    ui['detection-status'].textContent = `${error.message}${state.image ? ' Previous photo remains displayed.' : ''}`
    ui['edit-status'].textContent = 'Eye adjustment disabled. Choose a valid photo or retry detection on the previous photo.'
    ui.preview.setAttribute('aria-busy', 'false')
    ui.retry.hidden = !state.image
  }
}
ui['show-landmarks'].addEventListener('change', () => {
  ui.landmarks.hidden = !ui['show-landmarks'].checked
})
ui['large-preview'].addEventListener('change', () => {
  ui.comparison.classList.toggle('large', ui['large-preview'].checked)
})
ui['eye-strength'].addEventListener('input', () => { styleApplication=null; scheduleEdit() })
ui['face-strength'].addEventListener('input', () => { styleApplication=null; ui['include-face'].checked=Number(ui['face-strength'].value)>0; scheduleEdit() })
ui['reset-eye'].addEventListener('click', () => {
  styleApplication=null
  ui['include-face'].checked=false
  ui['eye-strength'].value = '0'
  ui['face-strength'].value = '0'
  scheduleEdit()
})
ui.file.addEventListener('change',()=>{const file=ui.file.files[0];ui.file.value='';loadPhoto(file)})

ui.retry.addEventListener('click', async () => {
  ui.retry.hidden = true
  initializeModel()
  if (state.image) await runDetection(++state.revision)
})
ui['save-preferences'].addEventListener('click', () => {
  if(state.isSample)return
  try {
    savedPreferences=preferenceStore.save({eye:ui['eye-strength'].disabled?0:Number(ui['eye-strength'].value),face:ui['face-strength'].disabled?0:Number(ui['face-strength'].value)})
    styleApplication=null
    window.dispatchEvent(new Event('styleme:preferences-saved'))
    ui['memory-status'].textContent=teachingProfile?.examples.length?'Quick preset saved; the taught profile stays active until Clear Teaching Profile.':'Confirmed preferences saved on this browser. Later slider changes are not saved automatically.'
    updateMemoryControls();updateAppliedStatus()
  } catch { ui['memory-status'].textContent='Preferences could not be saved. Browser storage may be unavailable or full; current edits are unchanged.' }
})
ui['apply-preferences'].addEventListener('click',applyRememberedStyle)
ui['clear-preferences'].addEventListener('click',()=>{
  try {
    preferenceStore.clear();savedPreferences=null;styleApplication=null
    ui['memory-status'].textContent=teachingProfile?.examples.length?'Quick-save memory cleared. Taught profile remains; use Clear Teaching Profile to remove it.':'Saved preferences cleared. Current edits are unchanged.'
    updateMemoryControls();updateAppliedStatus()
  } catch { ui['memory-status'].textContent='Memory could not be cleared. Browser storage is unavailable.' }
})
ui['style-mode'].addEventListener('change',()=>{ if(activePreferences() && state.pipeline)applyRememberedStyle() })
ui['include-face'].addEventListener('change',()=>{
  if(styleApplication)applyRememberedStyle()
  else if(!ui['include-face'].checked){ui['face-strength'].value='0';scheduleEdit()}
})
ui['confirm-example'].addEventListener('click',()=>{
  if(state.isSample || !state.pipeline || !state.photoId)return
  try {
    const confirmed={photoId:state.photoId,eye:ui['eye-strength'].disabled?null:Number(ui['eye-strength'].value),face:ui['face-strength'].disabled?null:Number(ui['face-strength'].value),geometry:profileGeometry(state.pipeline)}
    teachingProfile=profileStore.save(confirmExample(teachingProfile,confirmed))
    styleApplication=null
    window.dispatchEvent(new Event('styleme:confirmed'))
    ui['memory-status'].textContent='Setup choice confirmed. Profile medians updated; current edits unchanged. Replace the photo for the next example.'
    updateMemoryControls();updateAppliedStatus()
  } catch(error){ui['memory-status'].textContent=`Example could not be saved: ${error.message}`}
})
ui['clear-profile'].addEventListener('click',()=>{
  try {profileStore.clear();teachingProfile=null;styleApplication=null;ui['memory-status'].textContent='Teaching profile cleared; quick-save memory and current edits are unchanged.';updateMemoryControls();updateAppliedStatus()}
  catch {ui['memory-status'].textContent='Teaching profile could not be cleared; browser storage unavailable.'}
})
// Face model is loaded on the first portrait, never for Home decoration.

mountSiteShell({
 async loadSample(id){
  const sample=samples.find(s=>s.id===id);if(!sample)return
  const revision=++state.revision
  const response=await fetch(sample.src);if(!response.ok)throw new Error('Sample could not load. Try uploading a portrait.')
  const blob=await response.blob();if(revision!==state.revision)return
  await loadPhoto(new File([blob],sample.file,{type:sample.file.endsWith('.png')?'image/png':'image/jpeg'}),true)
 },session:()=>({original:state.original,
    isSample:state.isSample,landmarks:state.detection?.faces.length===1?state.detection.faces[0].normalizedLandmarks:null,profile:teachingProfile,preferences:savedPreferences})})

import './v3.css'

import './finalAlignment.css'
