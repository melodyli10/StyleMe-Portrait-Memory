import { PREFERENCE_KEY } from '../src/preferences.js'
const report=document.querySelector('#report'),frame=document.querySelector('#app-frame'),button=document.querySelector('#run')
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i])
const wait=async fn=>{const end=performance.now()+90000;while(!fn()){if(performance.now()>end)throw new Error('Timed out waiting for interface');await new Promise(r=>setTimeout(r,50))}}
button.addEventListener('click',async()=>{
  button.disabled=true;report.textContent='Running…'
  const previous=localStorage.getItem(PREFERENCE_KEY)
  let doc=frame.contentDocument,win=frame.contentWindow
  const get=id=>doc.getElementById(id)
  const check=(condition,message)=>{if(!condition)throw new Error(message);report.textContent+=`\nPASS: ${message}`}
  const settle=()=>new Promise(resolve=>win.requestAnimationFrame(()=>win.requestAnimationFrame(resolve)))
  const pixels=id=>{const c=get(id);return c.getContext('2d').getImageData(0,0,c.width,c.height).data}
  const input=(id,value)=>{get(id).value=String(value);get(id).dispatchEvent(new win.Event('input',{bubbles:true}))}
  const upload=async(file,expected='One face detected')=>{
    const transfer=new DataTransfer();transfer.items.add(file);get('file').files=transfer.files
    get('file').dispatchEvent(new win.Event('change',{bubbles:true}))
    await wait(()=>get('detection-status').textContent.startsWith(expected));await settle()
  }
  try {
    const urls=['https://storage.googleapis.com/mediapipe-assets/portrait.jpg','https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=90&fit=max']
    const files=await Promise.all(urls.map(async(url,i)=>{const response=await fetch(url);if(!response.ok)throw new Error('Public sample unavailable');return new File([await response.blob()],`public-${i}.jpg`,{type:'image/jpeg'})}))
    await upload(files[0]);check(!get('eye-strength').disabled && !get('face-strength').disabled,'first sample has eligible eye and face geometry')
    input('eye-strength',60);input('face-strength',30);await settle()
    get('save-preferences').click()
    const confirmed=localStorage.getItem(PREFERENCE_KEY)
    check(confirmed==='{"version":1,"eye":60,"face":30}','Save writes only confirmed numerical values')
    input('eye-strength',10);await settle()
    check(localStorage.getItem(PREFERENCE_KEY)===confirmed,'manual changes do not auto-save')
    await upload(files[1])
    check(get('eye-strength').value==='0' && get('face-strength').value==='0' && !get('include-face').checked,'replacement clears edits and experimental opt-in')
    check(localStorage.getItem(PREFERENCE_KEY)===confirmed && get('saved-settings').textContent.includes('60'),'replacement preserves visible saved preferences')
    const original=new Uint8ClampedArray(pixels('photo'))
    get('apply-preferences').click();await settle()
    check(get('eye-strength').value==='60' && get('face-strength').value==='0','Adaptive applies saved eyes on new landmarks; experimental face stays off')
    check(get('applied-status').textContent.includes('No additional strength adaptation'),'Adaptive reports unchanged eligible strengths honestly')
    const adaptive=new Uint8ClampedArray(pixels('edited'))
    check(!equal(adaptive,original),'remembered eyes produce a real edit on the second portrait')
    get('style-mode').value='fixed';get('style-mode').dispatchEvent(new win.Event('change'));await settle()
    check(equal(adaptive,pixels('edited')),'Fixed baseline and Adaptive are pixel-identical under the documented fallback')
    get('include-face').checked=true;get('include-face').dispatchEvent(new win.Event('change'));await settle()
    check(get('face-strength').value==='30' && !equal(adaptive,pixels('edited')),'explicit opt-in applies experimental remembered face strength')
    const fixedBoth=new Uint8ClampedArray(pixels('edited'))
    get('style-mode').value='adaptive';get('style-mode').dispatchEvent(new win.Event('change'));await settle()
    check(equal(fixedBoth,pixels('edited')) && localStorage.getItem(PREFERENCE_KEY)===confirmed,'switching modes preserves algorithms and saved preferences')
    check(equal(original,pixels('photo')),'original pixels stay immutable')
    get('reset-eye').click();await settle()
    check(equal(original,pixels('edited')) && get('eye-strength').value==='0' && get('face-strength').value==='0','Reset restores exact original and both zero strengths')
    check(localStorage.getItem(PREFERENCE_KEY)===confirmed,'Reset does not delete memory')
    await new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});win.location.reload()})
    doc=frame.contentDocument;win=frame.contentWindow
    await wait(()=>get('saved-settings')?.textContent.includes('60'))
    check(get('face-strength').value==='0' && !get('include-face').checked,'page reload loads saved values without applying experimental editing')
    const blank=document.createElement('canvas');blank.width=80;blank.height=64;blank.getContext('2d').fillStyle='#6e9caf';blank.getContext('2d').fillRect(0,0,80,64)
    const blob=await new Promise(r=>blank.toBlob(r,'image/png'));await upload(new File([blob],'no-face.png',{type:'image/png'}),'No face detected')
    check(get('apply-preferences').disabled && get('eye-strength').disabled && get('face-strength').disabled,'no-face image disables remembered application and editing')
    get('clear-preferences').click()
    check(localStorage.getItem(PREFERENCE_KEY)===null && get('saved-settings').textContent==='No saved preferences.','Clear Memory removes the confirmed record')
    report.textContent+='\nComplete. These are workflow/pixel checks, not evidence that adaptation improves quality.'
  }catch(error){report.textContent+=`\nFAIL / BLOCKED: ${error.message}`}
  finally {
    if(previous===null)localStorage.removeItem(PREFERENCE_KEY);else localStorage.setItem(PREFERENCE_KEY,previous)
    frame.src='/'
    report.textContent+='\nPrevious memory record restored.';button.disabled=false
  }
})
