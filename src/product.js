import {fitDisplayRectangle,comparisonPercent} from './displayRectangle.js'
import {mountInteractions} from './interactions.js'
import {mountProductUX} from './productUX.js'
import {pngBlob,downloadBlob} from './exportImage.js'
import {compareStyles} from './styleComparison.js'
import {profilePreferences} from './styleProfile.js'
import {translateText} from './translations.js'
import './product.css'
const text=value=>translateText(value,document.documentElement.lang)

export function mountProduct(app,editor,memory,api){
 const byId=id=>document.getElementById(id)
 editor.querySelector('.intro').insertAdjacentHTML('beforeend','<nav class="product-tabs" aria-label="Product navigation"><a href="#studio">Studio</a><a href="#teach">Teach StyleMe</a><a href="#my-style">My Style</a><a href="#compare">Compare</a></nav>')
 const layout=document.createElement('div');layout.className='editor-layout'
 const workspace=editor.querySelector('.workspace'),controls=editor.querySelector('.edit-controls')
 layout.append(workspace,controls);editor.querySelector('.intro').after(layout)
 memory.remove();memory.classList.add('profile-card')
 const eyeDetail=byId('eye-detail'),fold=document.createElement('details');fold.className='eye-fold'
 fold.innerHTML='<summary>Eye Detail</summary>';eyeDetail.before(fold);fold.append(eyeDetail)
 const diagnostics=editor.querySelector('.details'),diagnosticFold=document.createElement('details')
 workspace.querySelector('.toolbar').after(byId('detection-status'))
 diagnosticFold.className='diagnostic-fold';diagnosticFold.innerHTML='<summary>Detection and privacy</summary>';workspace.append(diagnosticFold);diagnosticFold.append(diagnostics)
 controls.insertAdjacentHTML('afterbegin','<div class="studio-actions"><button id="apply-style-studio" class="secondary">Apply My Style</button><button id="download-png" disabled>Download PNG</button></div><p id="export-status" role="status"></p>')
 controls.insertAdjacentHTML('beforeend','<a class="product-link" href="#teach">Teach StyleMe</a> · <a class="product-link" href="#compare">Compare</a>')
 app.insertAdjacentHTML('beforeend',`<main id="teach" class="product-view" hidden><p class="eyebrow">TEACH STYLEME</p><h1>Your Style, Taking Shape.</h1><p>Adjust first. Confirm only when this photo feels right.</p><nav class="product-tabs"><a href="#studio">Studio</a><a href="#my-style">My Style</a><a href="#compare">Compare</a></nav><div class="teaching-banner"><div><p id="teach-progress"></p><p id="teach-current"></p><p id="teach-next"></p><button id="teach-confirm" disabled>Confirm This Photo</button><p id="teach-feedback" role="status" aria-live="polite"></p></div><a href="#my-style" id="teaching-target" class="profile-card"><h2>My Style</h2><p id="teach-summary"></p><span>Review Profile →</span></a></div><div id="teach-editor-slot"></div></main>
 <main id="profile-view" class="product-view" hidden><p class="eyebrow">MY STYLE</p><h1 id="profile-heading"></h1><nav class="product-tabs"><a href="#studio">Studio</a><a href="#teach">Teach StyleMe</a><a href="#compare">Compare</a></nav><p>Current edits are temporary. Only confirmed choices become your profile.</p><button id="profile-apply">Apply My Style</button><div id="profile-slot"></div></main>
 <main id="compare" class="product-view" hidden><p class="eyebrow">COMPARE</p><h1>One portrait. Your choices.</h1><nav class="product-tabs"><a href="#studio">Studio</a><a href="#teach">Teach StyleMe</a><a href="#my-style">My Style</a></nav><p>Fixed Preset keeps saved strengths. Smart Style adapts only when your setup examples support it.</p><button id="compare-generate">Compare My Style</button><p id="compare-status" role="status">Upload one valid portrait and save a style first.</p><div class="style-comparison">${[['compare-original','Original'],['compare-fixed','Fixed Preset'],['compare-smart','Smart Style']].map(([id,label])=>`<figure><figcaption>${label}</figcaption><canvas id="${id}" hidden></canvas><p id="${id}-values"></p></figure>`).join('')}</div><details><summary>Applied settings explained</summary><p id="compare-explanation"></p></details></main>`)
 byId('profile-slot').append(memory)
 const updateUX=mountProductUX(app,controls,memory,api)
 editor.querySelector('.intro').insertAdjacentHTML('beforeend','<button id="studio-back" class="product-link secondary" hidden>← Back to Studio</button><section id="studio-landing" hidden><p>Your current edit is kept. Resume it or choose a new portrait.</p><button id="studio-resume">Resume editing</button> <button id="studio-replace" class="secondary">Upload photo</button></section>')
 let landing=false
 const showLanding=value=>{landing=value;layout.hidden=value;byId('studio-landing').hidden=!value;byId('studio-back').hidden=value||!api.session().original}
 byId('studio-back').onclick=()=>showLanding(true)
 byId('studio-resume').onclick=()=>showLanding(false)
 byId('studio-replace').onclick=()=>byId('upload').click()
 let route='',lastOriginal=null,lastLandmarks=null,animation=null
 const comparison=byId('comparison')
 // Every original/edited/debug layer inherits this one fitted rectangle.
 const sizePreview=()=>{
  const s=api.session();if(!s.original)return
  const stage=byId('preview'),large=byId('large-preview').checked
  const rect=fitDisplayRectangle(s.original.width,s.original.height,stage.clientWidth*(large?.96:.88),Math.max(0,stage.clientHeight*(large?.96:.80)-24))
  if(!rect.width)return
  comparison.style.width=rect.width+'px'
  comparison.style.setProperty('--display-height',rect.height+'px')
 }

 new ResizeObserver(sizePreview).observe(byId('preview'))
 comparison.classList.add('split-comparison')
 comparison.insertAdjacentHTML('beforeend','<div id="comparison-divider" role="slider" aria-label="Before/after divider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0"><span>↔</span></div>')
 // Status labels belong to the stage, outside the clipped image and divider.
 const labels=document.createElement('div');labels.className='comparison-labels'
 comparison.querySelectorAll('figcaption').forEach(caption=>labels.append(caption))
 byId('preview').prepend(labels)
 let position=50,dragging=false
 function setDivider(value){position=Math.max(0,Math.min(100,value));comparison.style.setProperty('--split',`${position}%`);byId('comparison-divider').setAttribute('aria-valuenow',String(Math.round(position)))}
 setDivider(50)
 const divider=byId('comparison-divider')
 divider.addEventListener('pointerdown',e=>{dragging=true;divider.setPointerCapture(e.pointerId);e.preventDefault()})
 divider.addEventListener('pointermove',e=>{if(dragging){const r=comparison.getBoundingClientRect();setDivider(comparisonPercent(e.clientX,r.left,r.width))}})
 for(const event of ['pointerup','pointercancel','lostpointercapture'])divider.addEventListener(event,()=>dragging=false)
 divider.addEventListener('keydown',e=>{const values={ArrowLeft:position-2,ArrowRight:position+2,Home:0,End:100};if(e.key in values){e.preventDefault();setDivider(values[e.key])}})
 byId('large-preview').addEventListener('change',()=>{requestAnimationFrame(sizePreview)})
 let hintShown=false
 function renderSummary(){
  sizePreview();const s=api.session(),count=s.profile?.examples.length||0,preferred=profilePreferences(s.profile)||s.preferences
  updateUX(preferred)
  if(s.original!==lastOriginal)showLanding(false)
  byId('studio-back').hidden=landing||!s.original
  byId('teach-progress').textContent=`${count}/5 confirmed examples.`
  byId('teach-current').textContent=`Current unsaved strengths: Eye Enlargement ${byId('eye-strength').value} · Face Slimming ${byId('face-strength').value}.`
  byId('teach-summary').textContent=preferred?`Saved: Eye Enlargement ${preferred.eye} · Face Slimming ${preferred.face}.`:'No saved preferences.'
  byId('teach-next').textContent=count===5?'Five examples confirmed. Try your style on a new portrait; adaptation is not guaranteed.':s.original?'Review this photo, then confirm or replace it for another example.':'Upload a setup portrait to begin.'
  byId('teach-confirm').disabled=byId('confirm-example').disabled
  byId('profile-apply').disabled=byId('apply-preferences').disabled
  byId('apply-style-studio').disabled=byId('apply-preferences').disabled
  byId('download-png').disabled=!s.original||byId('preview').getAttribute('aria-busy')==='true'
  byId('compare-generate').disabled=!s.original||!s.landmarks||!preferred
  if(s.original!==lastOriginal||s.landmarks!==lastLandmarks){lastOriginal=s.original;lastLandmarks=s.landmarks;setDivider(50);for(const id of ['compare-original','compare-fixed','compare-smart']){byId(id).hidden=true;byId(id).width=1;byId(id).height=1;byId(`${id}-values`).textContent=''}byId('compare-status').textContent='Upload one valid portrait and save a style first.';byId('compare-explanation').textContent='';byId('export-status').textContent='';byId('teach-feedback').textContent=''}
  if(s.original&&!hintShown&&(Number(byId('eye-strength').value)>0||Number(byId('face-strength').value)>0)){hintShown=true;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const start=performance.now(),origin=position;const tick=now=>{if(dragging)return;const t=Math.min(1,(now-start)/700);setDivider(origin+10*Math.sin(Math.PI*t));if(t<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}}
 }
 const refresh=()=>queueMicrotask(renderSummary)
 window.addEventListener('styleme:state',refresh)
 new MutationObserver(refresh).observe(byId('preview'),{attributes:true,attributeFilter:['aria-busy']})
 byId('teach-confirm').addEventListener('click',()=>byId('confirm-example').click())
 window.addEventListener('styleme:confirmed',()=>{
  renderSummary();byId('teach-feedback').textContent='Saved. Your style is taking shape.'
  if(route!=='teach'||matchMedia('(prefers-reduced-motion: reduce)').matches)return
  animation?.remove()
  const canvas=document.createElement('canvas'),source=byId('edited'),from=source.getBoundingClientRect(),to=byId('teaching-target').getBoundingClientRect()
  if(!from.width||!from.height)return
  canvas.width=100;canvas.height=Math.max(1,Math.round(100*source.height/source.width));canvas.getContext('2d').drawImage(source,0,0,canvas.width,canvas.height)
  canvas.className='teaching-flight';canvas.setAttribute('aria-hidden','true');Object.assign(canvas.style,{left:`${from.left+from.width/2}px`,top:`${from.top+from.height/2}px`});document.body.append(canvas);animation=canvas
  const effect=canvas.animate([{transform:'translate(-50%,-50%) scale(1)',opacity:.9},{transform:`translate(${to.left+to.width/2-from.left-from.width/2}px,${to.top+to.height/2-from.top-from.height/2}px) scale(.3)`,opacity:0}],{duration:750,easing:'ease-out'})
  effect.finished.then(()=>canvas.remove(),()=>canvas.remove())
 })
 for(const id of ['apply-style-studio','profile-apply'])byId(id).addEventListener('click',()=>{byId('apply-preferences').click();location.hash='studio'})
 byId('download-png').addEventListener('click',async()=>{
  const original=api.session().original;byId('download-png').disabled=true
  try{const blob=await pngBlob(byId('edited'));if(api.session().original!==original)throw new Error('Photo changed. Export the current photo again.');downloadBlob(blob,'StyleMe-edited.png');byId('export-status').textContent='PNG downloaded at original resolution.';window.dispatchEvent(new Event('styleme:exported'))}
  catch(error){byId('export-status').textContent=error.message}finally{renderSummary()}
 })
 function generateComparison(){
  const s=api.session(),saved=profilePreferences(s.profile)||s.preferences
  try{
   const result=compareStyles(s.original,s.landmarks,saved,s.profile,true)
   for(const [id,pixels]of [['compare-original',s.original],['compare-fixed',result.outputs[0]],['compare-smart',result.outputs[1]]]){const c=byId(id);c.width=pixels.width;c.height=pixels.height;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(pixels.data),pixels.width,pixels.height),0,0);c.hidden=false}
   result.outputs.forEach((r,i)=>byId(`compare-${i?'smart':'fixed'}-values`).textContent=`Applied eye ${r.applied.eye}, face ${r.applied.face}.`)
   byId('compare-status').textContent=result.identical?'Fixed Preset and Smart Style produced identical pixels.':'The outputs differ. Compare your own preference; neither mode is guaranteed better.'
   byId('compare-explanation').textContent=result.outputs.map(r=>r.notes.join(' ')).join(' ')
  }catch(error){byId('compare-status').textContent=error.message}
 }
 byId('compare-generate').addEventListener('click',generateComparison)
 function navigate(){
  route=location.hash.slice(1)||'home'
  const target=route==='my-style'?'profile-view':['studio','teach','compare','privacy','about','how-it-works'].includes(route)?route:'home'
  for(const id of ['home','studio','teach','profile-view','compare','privacy','about','how-it-works'])byId(id).hidden=id!==target
  if(route==='teach')byId('teach-editor-slot').append(layout);else editor.querySelector('.intro').after(layout)
  app.querySelectorAll('.site-header nav a').forEach(a=>{const active=a.hash===`#${route}`;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})
  renderSummary();if(route==='compare'&&!byId('compare-generate').disabled)generateComparison()
  requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'}))
 }
 window.addEventListener('hashchange',navigate);window.addEventListener('load',()=>window.scrollTo({top:0,left:0,behavior:'instant'}),{once:true});navigate();mountInteractions(api)
 // No success is implied by this transition; actual persistence emits confirmed.
 for(const id of ['clear-profile','clear-preferences'])byId(id).addEventListener('click',e=>{if(!window.confirm(text(id==='clear-profile'?'Delete your teaching profile? This cannot be undone.':'Delete your saved quick preset? This cannot be undone.'))){e.stopImmediatePropagation();e.preventDefault()}},true)
}
