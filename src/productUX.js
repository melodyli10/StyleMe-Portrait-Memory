import {profileReadiness} from './profileReadiness.js'
import {renderGuideSnippet} from './guideSnippet.js'
// Presentation only: move the existing controls so their listeners and state survive.
export function mountProductUX(app,controls,memory,api){
 const $=id=>document.getElementById(id)
 const section=(title)=>{const node=document.createElement('section');node.className='control-section';node.innerHTML=`<h2>${title}</h2>`;return node}
 const retouch=section('Retouch'),style=section('My Style'),exports=section('Export')
 const eyeHeading=$('eye-strength').previousElementSibling,eyeLabels=$('eye-strength').nextElementSibling
 retouch.append(eyeHeading,$('eye-strength'),eyeLabels,controls.querySelector('.face-control'),$('reset-eye'))
 const advanced=document.createElement('details');advanced.innerHTML='<summary>Editing details & limitations</summary>'
 advanced.append($('edit-status'),$('face-status'),retouch.querySelector('.face-note'),controls.querySelector('.eye-fold'))
 advanced.insertAdjacentHTML('beforeend','<p>Inspect cheeks, hair and background before export. Strong angles or an obscured jaw may reduce the available range.</p>');retouch.append(advanced)
 style.append($('apply-style-studio'));style.insertAdjacentHTML('beforeend','<p id="studio-next"></p><a class="product-link" href="#teach">Teach StyleMe →</a> <a class="product-link" href="#compare">Compare →</a>')
 exports.append($('download-png'),$('export-status'));exports.insertAdjacentHTML('beforeend','<p>Original resolution. Your original stays untouched.</p>')
 controls.replaceChildren(retouch,style,exports)
 $('empty').insertAdjacentHTML('beforeend','<button id="empty-upload">Upload photo</button>')
 $('empty-upload').onclick=()=>$('upload').click()
 const dashboard=document.createElement('div');dashboard.className='style-dashboard'
 dashboard.innerHTML=`<section class="profile-overview"><div><span class="eyebrow">Style Profile Progress</span><p id="profile-guidance"></p><a id="profile-next" class="pill" href="#teach">Teach My Style</a></div><div class="profile-count"><strong id="profile-count">0/5</strong><span>Confirmed photos</span></div><progress id="profile-meter" max="5" value="0" aria-label="Confirmed teaching photos"></progress><ol id="profile-steps" class="profile-steps" aria-label="Five-photo teaching progress">${[1,2,3,4,5].map(i=>`<li><span>${i}</span><small>Photo ${i}</small></li>`).join('')}</ol></section><section class="preferences-card"><p class="eyebrow">CONFIRMED PREFERENCES</p><h2>Remembered Settings</h2><p>Saved from your confirmed style. Current edits are temporary.</p><div class="preference-metrics"><div><strong id="profile-eye">—</strong><span>Eye Enlargement</span></div><div><strong id="profile-face">—</strong><span>Face Slimming</span></div></div><div id="profile-apply-slot"></div></section><section class="profile-actions"><h2>Use your style</h2><p>Choose a mode, then apply it to your current portrait.</p><div id="profile-mode-slot"></div></section><details class="profile-settings"><summary>Profile settings & details</summary><div id="profile-settings-slot"></div></details>`
 const slot=$('profile-slot');slot.prepend(dashboard)
 $('profile-apply-slot').append($('profile-apply'))
 $('profile-mode-slot').append(memory.querySelector('label[for="style-mode"]'),$('style-mode'),$('apply-preferences'),$('applied-status'))
 memory.querySelector('.memory-opt-in').hidden=true
 const settings=$('profile-settings-slot')
 settings.insertAdjacentHTML('beforeend','<h3>Quick preset</h3><p>Save current settings separately from your teaching profile.</p>')
 settings.append($('save-preferences'),$('saved-settings'),$('memory-status'),$('profile-review').parentElement)
 settings.insertAdjacentHTML('beforeend','<h3>Delete saved data</h3>')
 settings.append($('clear-preferences'),$('clear-profile'))
 // The original confirmation control remains the single source of truth.
 $('teaching-target').append($('teaching-progress'))
 $('confirm-example').hidden=true;$('teach').append($('confirm-example'))
 memory.hidden=true;slot.append(memory)
 $('profile-view').querySelector(':scope > p:not(.eyebrow)').remove()
 const steps=[
 ['Upload','Your original, always protected.','Choose a clear, single-person JPG or PNG. Detection runs on your device; replacing a photo clears the previous editing state.','studio','Upload photo','↑'],
 ['Edit','Make it feel like you.','Adjust Eye Enlargement and inspect the before/after divider. Face Slimming starts at zero; adjust it while comparing the contour.','studio','Start Editing','↔'],
 ['Confirm','You decide what is remembered.','Only confirm when you are happy with your edits. Slider changes alone never update your saved preferences.','teach','Teach My Style','✓'],
 ['Build Profile','Five portraits. One personal starting point.','Confirm five different photos. StyleMe uses the median of your choices, not neural-network training.','my-style','My Style','1 · 2 · 3 · 4 · 5'],
 ['Apply','Bring your style to a new portrait.','Upload a different photo and apply your saved profile. Smart Style adjusts strength only when your setup geometry supports a rule.','studio','Apply My Style','↓'],
 ['Compare','Your preference is the final judge.','Compare Fixed Preset and Smart Style on the same original. They may be identical; neither is guaranteed better.','compare','Compare','A / B']]
 app.insertAdjacentHTML('beforeend',`<main id="how-it-works" class="product-view guide-view" hidden><p class="eyebrow">A SIMPLE 6-STEP JOURNEY</p><h1>How StyleMe Works</h1><p>From your first edit to a personal style you can use again.</p><div class="guide-layout"><nav class="guide-steps" aria-label="Workflow steps">${steps.map((s,i)=>`<button data-step="${i}" aria-pressed="${i===0}"><span>0${i+1}</span>${s[0]}</button>`).join('')}</nav><section class="guide-panel" aria-live="polite"><p id="guide-number" class="eyebrow"></p><h2 id="guide-title"></h2><p id="guide-copy"></p><a id="guide-action" class="pill"></a><div class="guide-controls"><button id="guide-previous" class="secondary">← Previous</button><button id="guide-replay" class="secondary">Replay</button><button id="guide-next" class="secondary">Next step →</button></div><div id="guide-art"></div></section></div></main>`)
 let step=0
 function showStep(i){step=i;const s=steps[i];renderGuideSnippet($('guide-art'),i); const panel=$('guide-art').closest('.guide-panel');panel.classList.remove('step-changed');void panel.offsetWidth;panel.classList.add('step-changed');$('guide-number').textContent=`0${i+1} / 06`; $('guide-title').textContent=s[1];$('guide-copy').textContent=s[2];$('guide-action').textContent=s[4];$('guide-action').href=`#${s[3]}`;$('guide-next').disabled=i===5;$('guide-previous').disabled=i===0;app.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.step)===i)))}
 app.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>showStep(Number(b.dataset.step)));$('guide-next').onclick=()=>showStep(Math.min(5,step+1));$('guide-previous').onclick=()=>showStep(Math.max(0,step-1));$('guide-replay').onclick=()=>showStep(step);showStep(0)
 window.addEventListener('styleme:confirmed',()=>{dashboard.classList.remove('saved-pulse');void dashboard.offsetWidth;dashboard.classList.add('saved-pulse')})
 return (preferred)=>{
  const s=api.session(),count=s.profile?.examples.length||0
  const readiness=profileReadiness(count)
  $('profile-heading').textContent=count===5?'Your personal style, saved and ready.':'Your personal style, taking shape.'
  $('profile-count').textContent=`${count}/5`; $('profile-meter').value=count
  $('profile-guidance').textContent=readiness.helper
  $('profile-next').textContent=count===5?'Start Editing':'Teach My Style';$('profile-next').href=count===5?'#studio':'#teach'
  $('profile-eye').textContent=preferred?.eye??'—';$('profile-face').textContent=preferred?.face??'—'
  $('profile-steps').querySelectorAll('li').forEach((n,i)=>{n.classList.toggle('complete',i<count);n.firstElementChild.textContent=i<count?'✓':i+1})
  $('studio-next').textContent=readiness.helper
  app.querySelectorAll('.product-tabs a').forEach(a=>{const active=a.hash===location.hash;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})
 }
}
