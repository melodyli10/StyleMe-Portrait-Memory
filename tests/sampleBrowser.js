import {PROFILE_KEY} from '../src/styleProfile.js'
import {PREFERENCE_KEY} from '../src/preferences.js'
import {pngBlob} from '../src/exportImage.js'
const frame=document.querySelector('iframe'),report=document.querySelector('#report')
const wait=async fn=>{const end=Date.now()+90000;while(!fn()){if(Date.now()>end)throw Error('Timeout');await new Promise(r=>setTimeout(r,50))}}
document.querySelector('#run').onclick=async()=>{
 const button=document.querySelector('#run');button.disabled=true
 const backup=[PROFILE_KEY,PREFERENCE_KEY].map(k=>[k,localStorage.getItem(k)])
 const d=frame.contentDocument,w=frame.contentWindow,get=id=>d.getElementById(id)
 const check=(ok,text)=>{if(!ok)throw Error(text);report.textContent+='PASS: '+text+'\n'}
 const settle=()=>new Promise(r=>w.requestAnimationFrame(()=>w.requestAnimationFrame(r)))
 const pixels=id=>{const c=get(id);return c.getContext('2d').getImageData(0,0,c.width,c.height).data}
 const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i])
 try{
  await wait(()=>d.querySelector('[data-sample]'));w.location.hash='studio';await settle()
  d.querySelector('[data-sample]').click();await wait(()=>!get('eye-strength').disabled);await settle()
  check(get('photo').width===500&&get('photo').height===750,'approved sample detected at original 500 × 750 resolution')
  check(get('confirm-example').disabled&&get('save-preferences').disabled,'sample cannot be confirmed or saved into memory')
  const original=new Uint8ClampedArray(pixels('photo'))
  get('eye-strength').value='60';get('eye-strength').dispatchEvent(new w.Event('input'));await settle()
  check(!same(original,pixels('edited'))&&same(original,pixels('photo')),'real editing changes output and preserves original')
  const figures=[...get('comparison').querySelectorAll(':scope > figure')].map(e=>e.getBoundingClientRect())
  check(Math.abs(figures[0].width-figures[1].width)<1&&Math.abs(figures[0].left-figures[1].left)<1,'divider layers share identical display coordinates')
  for(const id of ['confirm-example','save-preferences'])get(id).dispatchEvent(new w.Event('click'))
  check(backup.every(([k,v])=>localStorage.getItem(k)===v),'even dispatched confirmation cannot persist demo preferences')
  const bitmap=await createImageBitmap(await pngBlob(get('edited')))
  check(bitmap.width===500&&bitmap.height===750,'PNG export preserves full sample resolution');bitmap.close()
  get('reset-eye').click();await settle();check(same(original,pixels('edited')),'reset restores exact original pixels')
  check(backup.every(([k,v])=>localStorage.getItem(k)===v),'existing profile and preferences remain unchanged')
  report.textContent+='ALL SAMPLE CHECKS PASSED'
 }catch(e){report.textContent+='FAIL: '+e.message}finally{button.disabled=false}
}
