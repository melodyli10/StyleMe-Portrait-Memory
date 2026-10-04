import {mountHomeMotion} from './homeMotion.js'
import {samples} from './samples.js'
import {translateText} from './translations.js'
export function mountInteractions(api){
 const $=id=>document.getElementById(id),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches
 mountHomeMotion()
 const logo=document.querySelector('.brand-badge')
 try{if(!sessionStorage.getItem('styleme.brand-intro.v3')){logo?.classList.add('brand-intro');sessionStorage.setItem('styleme.brand-intro.v3','1')}}catch{}
 window.addEventListener('styleme:rendered',event=>{
  if(!event.detail.remembered)return
  if(!reduced()){const from=document.querySelector('.site-header a[href="#my-style"]')?.getBoundingClientRect(),to=$('edited')?.getBoundingClientRect();if(from&&to?.width){const frame=document.createElement('span');frame.className='memory-transfer-frame';frame.setAttribute('aria-hidden','true');Object.assign(frame.style,{left:from.left+'px',top:from.top+'px'});document.body.append(frame);frame.animate([{transform:'translate(0,0)',opacity:.6},{transform:`translate(${to.left+to.width/2-from.left}px,${to.top+to.height/2-from.top}px) scale(1.4)`,opacity:0}],{duration:700,easing:'cubic-bezier(.22,.61,.36,1)'}).finished.then(()=>frame.remove(),()=>frame.remove())}}
  const preview=$('preview');preview.classList.remove('style-applied');void preview.offsetWidth;preview.classList.add('style-applied')
 })
 const samplePanel=document.createElement('section');samplePanel.className='sample-panel'
 samplePanel.innerHTML=`<div class="sample-options">${samples.map((s,i)=>`<button class="sample-button" data-sample="${s.id}" aria-label="Try sample portrait ${i+1}"><img src="${s.src}" alt="" width="44" height="48"><span>Try Sample</span> <span aria-hidden="true">→</span></button>`).join('')}</div><p id="sample-feedback" role="status"></p><details><summary>Sample credits & privacy</summary><p>One approved Pexels demo. Not a customer or an editing result. The sample cannot teach your profile or enter evaluation.</p><p>${samples.map(s=>`<a href="${s.url}" target="_blank" rel="noreferrer">${s.name}</a>`).join(' · ')}</p></details>`
 $('empty-upload').after(samplePanel)
 const sampleNote=document.createElement('p');sampleNote.id='sample-note';sampleNote.hidden=true;sampleNote.textContent='Demo portrait — editing and export enabled. Upload your own photo to teach StyleMe.'
 document.querySelector('.toolbar').after(sampleNote)
 $('teach-next').after(Object.assign(document.createElement('p'),{id:'teach-sample-note'}))
 for(const b of samplePanel.querySelectorAll('[data-sample]'))b.onclick=async()=>{
  samplePanel.querySelectorAll('button').forEach(n=>n.disabled=true);$('sample-feedback').textContent='Loading demo portrait…'
  try{await api.loadSample(b.dataset.sample);$('sample-feedback').textContent=''}catch(error){$('sample-feedback').textContent=error.message}
  finally{samplePanel.querySelectorAll('button').forEach(n=>n.disabled=false);update()}
 }
 $('empty-upload').insertAdjacentHTML('afterend','<p class="empty-privacy">Start with one clear portrait. Your photo stays on this device.</p>')
 const badge=document.createElement('span');badge.id='editor-state';badge.className='editor-state';badge.setAttribute('role','status');document.querySelector('.toolbar h2').after(badge)
 const toast=document.createElement('div');toast.id='product-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.querySelector('#app').append(toast)
 let timer
 const notify=message=>{clearTimeout(timer);toast.textContent=translateText(message,document.documentElement.lang);toast.classList.add('visible');timer=setTimeout(()=>toast.classList.remove('visible'),3500)}
 window.addEventListener('styleme:confirmed',()=>notify('Saved. Your style is taking shape.'))
 window.addEventListener('styleme:preferences-saved',()=>notify('Saved. Your style is taking shape.'))
 window.addEventListener('styleme:exported',()=>notify('PNG downloaded at original resolution.'))
 $('reset-eye').addEventListener('click',()=>{requestAnimationFrame(()=>{if($('eye-strength').value==='0'&&$('face-strength').value==='0')notify('Original restored. Saved preferences are unchanged.')})})
 let previousOriginal=null
 function update(){
  const s=api.session(),busy=$('preview').getAttribute('aria-busy')==='true',edited=Number($('eye-strength').value)>0||Number($('face-strength').value)>0
  const label=busy?'Processing locally':!s.original?'Ready to upload':!s.landmarks?'Detection unavailable':edited?'Edited':'Original'
  badge.textContent=label;badge.dataset.state=busy?'busy':edited?'edited':'ready'
  $('sample-note').hidden=!s.isSample;$('teach-sample-note').textContent=s.isSample?'Demo portrait — editing and export enabled. Upload your own photo to teach StyleMe.':''
  if(s.original!==previousOriginal){previousOriginal=s.original;$('preview').classList.remove('photo-arrived');if(s.original){void $('preview').offsetWidth;$('preview').classList.add('photo-arrived')}}
 }
 window.addEventListener('styleme:state',()=>queueMicrotask(update))
 for(const id of ['eye-strength','face-strength'])$(id).addEventListener('input',update)
 new MutationObserver(update).observe($('preview'),{attributes:true,attributeFilter:['aria-busy']});update()
}
