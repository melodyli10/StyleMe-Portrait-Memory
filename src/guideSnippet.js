import secondPortrait from './assets/samples/walkthrough-second.png'
import {samples} from './samples.js'
import {fitDisplayRectangle,comparisonPercent} from './displayRectangle.js'
// Cached decoded assets, not an editing engine. Never writes the user's profile.
const decoded=new Map()
function preload(src){
 if(!decoded.has(src)){
  const image=new Image();image.src=src
  const ready=image.decode?image.decode():new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject})
  decoded.set(src,ready.then(()=>image))
 }
 return decoded.get(src)
}
for(const src of [samples[0].src,secondPortrait])preload(src).catch(()=>{})
let cleanup=()=>{}
export function renderGuideSnippet(host,step){
 cleanup();let alive=true;const disposers=[];cleanup=()=>{alive=false;disposers.forEach(f=>f())}
 const slider=(name,value)=>`<label class="snippet-slider">${name}<output>${value}</output><input type="range" min="0" max="100" value="${value}" aria-label="${name}"></label>`
 const titles=['Upload photo','Eye Enlargement','Confirm preference','My Style','Apply My Style','Compare']
 const visual=step===0?`<div class="snippet-upload"><button>Upload photo</button></div>`:step===3?`<div class="snippet-profile"><strong>1/5</strong><progress max="5" value="1" aria-label="Illustrated progress"></progress><span>Confirmed photos</span><div class="snippet-dots"><b>✓</b><b>2</b><b>3</b><b>4</b><b>5</b></div><p>Illustrated preferences</p></div>`:`<div class="snippet-photo"></div>`
 host.innerHTML=`<div class="snippet"><header><strong>StyleMe</strong><span>${titles[step]}</span></header><div class="snippet-body">${visual}<div class="snippet-tools">${step===1?slider('Eye Enlargement',60)+slider('Face Slimming',30):step===2?`<p>Illustrated preferences</p><button class="snippet-confirm">Confirm preference</button><p class="snippet-feedback" role="status"></p>`:step===4?`<p>New portrait illustration</p><button class="snippet-apply">Apply My Style</button>${slider('Eye Enlargement',0)}${slider('Face Slimming',0)}<p class="snippet-feedback" role="status"></p>`:step===5?`<label>Compare<input class="snippet-divider" type="range" min="0" max="100" value="50" aria-label="Before/after divider"></label><p>Illustrated preferences</p><p>Eye Enlargement <b>60</b></p><p>Face Slimming <b>30</b></p><p>Reset to Original</p><p>Download PNG</p>`:''}</div></div><footer>Illustrated simulation. No photo is edited and nothing is saved.</footer></div>`
 let percent=50
 const setPercent=value=>{percent=Math.max(0,Math.min(100,Number(value)));host.querySelector('.snippet-image-frame')?.style.setProperty('--mini-split',percent+'%');const range=host.querySelector('.snippet-divider');if(range)range.value=percent;host.querySelector('.snippet-line')?.setAttribute('aria-valuenow',String(Math.round(percent)))}
 const mountPhoto=async(stage,src)=>{
  try{const image=await preload(src);if(!alive)return
   const frame=document.createElement('div');frame.className='snippet-image-frame'
   const copy=()=>{const img=image.cloneNode();img.alt='';return img}
   frame.append(copy());stage.replaceChildren(frame)
   if(step===5){const after=document.createElement('div');after.className='snippet-after';after.append(copy());frame.append(after);const line=document.createElement('div');line.className='snippet-line';line.tabIndex=0;line.setAttribute('role','slider');line.setAttribute('aria-label','Before/after divider');line.setAttribute('aria-valuemin','0');line.setAttribute('aria-valuemax','100');frame.append(line)
    let dragging=false
    const move=e=>{const r=frame.getBoundingClientRect();setPercent(comparisonPercent(e.clientX,r.left,r.width))}
    line.onpointerdown=e=>{dragging=true;line.setPointerCapture(e.pointerId);move(e);e.preventDefault()};line.onpointermove=e=>{if(dragging)move(e)}
    for(const event of ['pointerup','pointercancel','lostpointercapture'])line.addEventListener(event,()=>dragging=false)
    line.onkeydown=e=>{const v={ArrowLeft:percent-1,ArrowRight:percent+1,Home:0,End:100};if(e.key in v){e.preventDefault();setPercent(v[e.key])}}
   }
   const size=()=>{const r=fitDisplayRectangle(image.naturalWidth,image.naturalHeight,stage.clientWidth,stage.clientHeight);frame.style.width=r.width+'px';frame.style.height=r.height+'px'}
   const observer=new ResizeObserver(size);observer.observe(stage);disposers.push(()=>observer.disconnect());size();setPercent(percent)
  }catch{if(alive)stage.textContent='Portrait could not load. Replay to retry.'}
 }
 if(step!==0&&step!==3)mountPhoto(host.querySelector('.snippet-photo'),step>=4?secondPortrait:samples[0].src)
 const upload=host.querySelector('.snippet-upload button');if(upload)upload.onclick=()=>mountPhoto(host.querySelector('.snippet-upload'),samples[0].src)
 host.querySelectorAll('.snippet-slider').forEach(label=>label.querySelector('input').oninput=e=>label.querySelector('output').textContent=e.target.value)
 const confirm=host.querySelector('.snippet-confirm');if(confirm)confirm.onclick=()=>{host.querySelector('.snippet-feedback').textContent='Remembered ✓';host.querySelector('.snippet').classList.add('snippet-confirmed');confirm.disabled=true}
 const apply=host.querySelector('.snippet-apply');if(apply)apply.onclick=()=>{host.querySelectorAll('.snippet-slider').forEach((label,i)=>{label.querySelector('input').value=i?30:60;label.querySelector('output').textContent=i?'30':'60'});host.querySelector('.snippet-feedback').textContent='Your style, applied.';apply.disabled=true;host.querySelector('.snippet').classList.add('snippet-confirmed')}
 const range=host.querySelector('.snippet-divider');if(range)range.oninput=e=>setPercent(e.target.value)
 if(step===1&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const start=performance.now(),range=host.querySelector('.snippet-slider input');const tick=now=>{if(!alive)return;const t=Math.min(1,(now-start)/700);range.value=Math.round(30+30*t);range.previousElementSibling.textContent=range.value;if(t<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)}
 if(step===3&&!matchMedia('(prefers-reduced-motion: reduce)').matches){let count=1;const timer=setInterval(()=>{if(!alive||count===5){clearInterval(timer);return}count++;host.querySelector('.snippet-profile strong').textContent=count+'/5';host.querySelector('progress').value=count;host.querySelectorAll('.snippet-dots b').forEach((b,i)=>{if(i<count)b.textContent='✓'})},650);disposers.push(()=>clearInterval(timer))}
}
