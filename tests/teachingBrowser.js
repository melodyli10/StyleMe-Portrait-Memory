import {pngBlob} from '../src/exportImage.js'
import {LANGUAGE_KEY} from '../src/translations.js'
import {PROFILE_KEY} from '../src/styleProfile.js'
import {PREFERENCE_KEY} from '../src/preferences.js'
const report=document.querySelector('#report'),frame=document.querySelector('#app-frame'),button=document.querySelector('#run')
const wait=async fn=>{const end=performance.now()+90000;while(!fn()){if(performance.now()>end)throw new Error('Interface timeout');await new Promise(r=>setTimeout(r,50))}}
button.addEventListener('click',async()=>{
  button.disabled=true;report.textContent='Running two-public-photo teaching workflow…'
  const backup=new Map([PROFILE_KEY,PREFERENCE_KEY,LANGUAGE_KEY].map(k=>[k,localStorage.getItem(k)]))
  let doc=frame.contentDocument,win=frame.contentWindow
  const get=id=>doc.getElementById(id),check=(ok,msg)=>{if(!ok)throw new Error(msg);report.textContent+=`\nPASS: ${msg}`}
  const reload=async()=>{await new Promise(r=>{frame.addEventListener('load',r,{once:true});win.location.reload()});doc=frame.contentDocument;win=frame.contentWindow;await wait(()=>get('teaching-progress'));win.confirm=()=>true}
  const settle=()=>new Promise(r=>win.requestAnimationFrame(()=>win.requestAnimationFrame(r)))
  const pixels=id=>{const c=get(id);return c.getContext('2d').getImageData(0,0,c.width,c.height).data}
  const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i])
  const upload=async file=>{const dt=new DataTransfer();dt.items.add(file);get('file').files=dt.files;get('file').dispatchEvent(new win.Event('change'));await wait(()=>get('detection-status').textContent.startsWith('One face detected'));await settle()}
  const setEye=async n=>{get('eye-strength').value=String(n);get('eye-strength').dispatchEvent(new win.Event('input'));await settle()}
  try {
    localStorage.removeItem(PROFILE_KEY);localStorage.removeItem(PREFERENCE_KEY);localStorage.setItem(LANGUAGE_KEY,'en');await reload();win.location.hash='studio';await settle();check(!get('studio').hidden && get('home').hidden,'Studio navigation opens the existing editor')
    const urls=['https://storage.googleapis.com/mediapipe-assets/portrait.jpg','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=90&fit=max']
    const files=await Promise.all(urls.map(async(url,i)=>{const r=await fetch(url);if(!r.ok)throw new Error('Public sample unavailable');return new File([await r.blob()],`setup-${i}.jpg`,{type:'image/jpeg'})}))
    await upload(files[0]);await setEye(60)
    check(localStorage.getItem(PROFILE_KEY)===null,'upload and slider changes do not create a profile')
    get('confirm-example').click()
    check(get('teaching-progress').textContent.startsWith('1/5'),'first confirmation updates progress')
    await setEye(65);get('confirm-example').click()
    check(JSON.parse(localStorage.getItem(PROFILE_KEY)).examples.length===1,'same photo updates its example instead of counting twice')
    await upload(files[1]);check(get('eye-strength').value==='0' && !get('include-face').checked,'replacement resets edits/experimental opt-in and retains profile')
    await setEye(75);get('confirm-example').click()
    const saved=localStorage.getItem(PROFILE_KEY),profile=JSON.parse(saved)
    check(profile.examples.length===2 && get('saved-settings').textContent.includes('70'),'second distinct photo forms median eye preference 70')
    check(profile.examples.every(e=>Object.keys(e).sort().join(',')==='eye,face,geometry,photoId' && Object.keys(e.geometry).sort().join(',')==='eyeAspect,faceWidthBalance'),'only allowlisted strengths, ratios and digests persist')
    const original=new Uint8ClampedArray(pixels('photo'))
    get('apply-preferences').click();await settle()
    check(get('eye-strength').value==='70' && get('face-strength').value==='0','new photo uses profile median and keeps experimental slimming off')
    check(get('applied-status').textContent.includes('Five valid eye examples'),'Adaptive explains insufficient evidence instead of manufacturing a difference')
    const adaptive=new Uint8ClampedArray(pixels('edited'))
    const originalCanvas=get('photo'), editedCanvas=get('edited')
    for(const locale of ['zh','ko','hi','en']){
      get('language').value=locale;get('language').dispatchEvent(new win.Event('change'));await settle()
      check(doc.documentElement.lang===locale && localStorage.getItem(LANGUAGE_KEY)===locale,`${locale}: language selection and persistence`)
      check(originalCanvas===get('photo') && editedCanvas===get('edited') && equal(original,pixels('photo')) && equal(adaptive,pixels('edited')) && get('eye-strength').value==='70' && localStorage.getItem(PROFILE_KEY)===saved,`${locale}: language preserves canvas nodes, original, edit pixels, slider and profile`)
    }
    win.location.hash='my-style';await settle();check(!get('profile-view').hidden && get('profile-review').textContent.includes('Example 2'),'My Style shows real confirmed example records')
    check(get('profile-count').textContent==='2/5' && get('profile-eye').textContent==='70','dashboard shows actual progress and median, not placeholder data')
    check(!get('profile-view').querySelector('.profile-settings').open,'destructive settings stay collapsed by default')
    win.location.hash='how-it-works';await settle();check(!get('how-it-works').hidden && get('home').hidden,'guide is a separate product view')
    doc.querySelector('[data-step="3"]').click();await settle();check(get('guide-number').textContent==='04 / 06' && get('guide-action').hash==='#my-style','interactive guide changes explanation and destination')
    win.location.hash='home';await settle();check(!get('home').hidden && get('studio').hidden,'Home navigation preserves editor state')
    win.location.hash='studio';await settle();check(equal(adaptive,pixels('edited')),'returning to Studio retains edited pixels')
    const exported=await pngBlob(get('edited')),bitmap=await createImageBitmap(exported),exportCanvas=document.createElement('canvas');exportCanvas.width=bitmap.width;exportCanvas.height=bitmap.height;exportCanvas.getContext('2d').drawImage(bitmap,0,0)
    check(bitmap.width===get('photo').width&&bitmap.height===get('photo').height&&equal(adaptive,exportCanvas.getContext('2d').getImageData(0,0,bitmap.width,bitmap.height).data),'PNG encoding retains original dimensions and actual edited pixels');bitmap.close()
    win.location.hash='compare';await settle();check(!get('compare').hidden && get('compare-status').textContent.includes('identical pixels'),'Compare view honestly reports identical fixed/smart outputs')
    check(equal(adaptive,pixels('compare-smart'))&&equal(original,pixels('compare-original')),'Compare uses actual aligned original and processed pixels')
    win.location.hash='teach';await settle();check(get('teach-editor-slot').contains(get('photo'))&&!get('teach').hidden,'Teach view reuses current photo without resetting editor')
    let savedBeforeAnimation=false
    win.addEventListener('styleme:confirmed',()=>{savedBeforeAnimation=JSON.parse(localStorage.getItem(PROFILE_KEY)).examples.length===2},{once:true})
    // Reconfirm B's existing 75 setting, so the later baseline comparison remains unchanged.
    await setEye(75);get('teach-confirm').click();await settle()
    check(savedBeforeAnimation && get('teach-feedback').textContent.includes('Saved.'),'signature confirmation occurs only after real persistence')
    check(win.matchMedia('(prefers-reduced-motion: reduce)').matches || !!doc.querySelector('.teaching-flight'),'teaching animation uses a temporary session-only canvas')
    await setEye(70)
    win.location.hash='studio';await settle()
    const divider=get('comparison-divider');divider.dispatchEvent(new win.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));check(divider.getAttribute('aria-valuenow')==='52','divider supports keyboard input');get('reset-divider').click();check(divider.getAttribute('aria-valuenow')==='50','divider resets to center')
    get('style-mode').value='fixed';get('style-mode').dispatchEvent(new win.Event('change'));await settle()
    check(equal(adaptive,pixels('edited')),'Fixed and unsupported Adaptive match exactly')
    get('reset-eye').click();await settle()
    check(equal(original,pixels('edited')) && localStorage.getItem(PROFILE_KEY)===saved,'exact reset preserves confirmed profile')
    check(!get('face-strength').disabled,'experimental face control available on public sample')
    get('face-strength').value='50';get('face-strength').dispatchEvent(new win.Event('input'));await settle()
    const faceOnly=new Uint8ClampedArray(pixels('edited'))
    check(!equal(original,faceOnly) && equal(original,pixels('photo')),'face-only edit changes output and preserves original')
    await setEye(60);check(!equal(faceOnly,pixels('edited')) && equal(original,pixels('photo')),'combined face and eye edits preserve original')
    get('reset-eye').click();await settle();check(equal(original,pixels('edited')) && !get('include-face').checked,'combined editing reset restores exact original and clears experimental opt-in')
    await upload(files[0]);check(get('confirm-example').textContent.includes('Update'),'re-uploading the same file is recognized without persisting an image')
    get('language').value='ko';get('language').dispatchEvent(new win.Event('change'));await settle();await reload();check(doc.documentElement.lang==='ko','language survives refresh');get('language').value='en';get('language').dispatchEvent(new win.Event('change'));await settle();check(get('teaching-progress').textContent.startsWith('2/5') && get('eye-strength').value==='0','reload preserves profile but applies no edits')
    get('clear-profile').click();check(localStorage.getItem(PROFILE_KEY)===null && get('teaching-progress').textContent.startsWith('0/5'),'Clear Teaching Profile removes confirmed examples')
    report.textContent+='\nComplete. Five-example fitting is covered by deterministic unit tests; this browser run used two public portraits.'
  }catch(error){report.textContent+=`\nFAIL / BLOCKED: ${error.message}`}
  finally{for(const [key,value]of backup){if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value)}frame.src='/';button.disabled=false;report.textContent+='\nPrevious local profile and quick memory restored.'}
})
