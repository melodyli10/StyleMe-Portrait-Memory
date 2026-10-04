import {demoState} from './memoryDemoState.js'
export function mountMemoryDemo(parent){
 const node=document.createElement('section');node.className='memory-demo'
 node.innerHTML=`<div><p class="eyebrow">MEMORY WALKTHROUGH</p><h2>See how remembering works.</h2><p>Illustrated simulation. No photo is edited and nothing is saved.</p><div class="demo-nav"><button data-demo="play">Play / Replay</button><button data-demo="previous" class="secondary">Previous</button><button data-demo="next" class="secondary">Next step →</button></div></div><div class="demo-editor"><div class="demo-portrait" aria-hidden="true"><svg viewBox="0 0 100 110" fill="none"><rect x="8" y="4" width="84" height="102" rx="12" stroke="currentColor"/><circle cx="50" cy="38" r="18" stroke="currentColor"/><path d="M20 91c0-45 60-45 60 0" stroke="currentColor"/></svg></div><p class="demo-stage" role="status"></p><label>Eye Enlargement <output>0</output><input type="range" min="0" max="100" value="0" disabled aria-label="Simulated eye strength"></label><button class="demo-action">Confirm preference</button><p class="demo-memory"></p></div>`
 parent.append(node)
 let index=0,timer
 const render=()=>{const s=demoState(index);node.dataset.stage=s.index;node.querySelector('.demo-stage').replaceChildren(Object.assign(document.createElement('span'),{textContent:`${s.index+1} / 7 · `}),Object.assign(document.createElement('span'),{textContent:s.label}));node.querySelector('output').textContent=s.strength;node.querySelector('input').value=s.strength;node.querySelector('.demo-portrait').classList.toggle('second',s.second);const action=node.querySelector('.demo-action');action.textContent=s.second?'Apply My Style':'Confirm preference';action.disabled=!(s.index===2||s.index===5);node.querySelector('.demo-memory').textContent=s.saved?'Illustrated preference: 60':'No illustrated preference yet';node.querySelector('[data-demo=previous]').disabled=index===0;node.querySelector('[data-demo=next]').disabled=index===6}
 const stop=()=>clearInterval(timer)
 node.querySelector('[data-demo=play]').onclick=()=>{stop();index=0;render();timer=setInterval(()=>{if(document.hidden||parent.hidden||index===6){stop();return}index++;render()},1800)}
 node.querySelector('[data-demo=previous]').onclick=()=>{stop();index=Math.max(0,index-1);render()}
 node.querySelector('[data-demo=next]').onclick=()=>{stop();index=Math.min(6,index+1);render()}
 node.querySelector('.demo-action').onclick=()=>{stop();index++;render()}
 window.addEventListener('hashchange',stop);render()
}
