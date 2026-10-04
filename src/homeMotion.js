// Decorative Home motion only; no editing, detection or storage calls.
export function mountHomeMotion(){
 const home=document.querySelector('#home'),hero=home.querySelector('.hero'),media=matchMedia('(prefers-reduced-motion: reduce)')
 let frame=0,bounds,x=0,y=0
 const paint=()=>{frame=0;hero.style.setProperty('--depth-x',`${x}px`);hero.style.setProperty('--depth-y',`${y}px`)}
 const reset=()=>{cancelAnimationFrame(frame);frame=0;x=0;y=0;paint()}
 hero.addEventListener('pointerenter',()=>{bounds=hero.getBoundingClientRect()})
 hero.addEventListener('pointermove',e=>{if(media.matches||e.pointerType==='touch')return;bounds ||= hero.getBoundingClientRect();x=Math.max(-3,Math.min(3,(e.clientX-bounds.left-bounds.width/2)/bounds.width*6));y=Math.max(-3,Math.min(3,(e.clientY-bounds.top-bounds.height/2)/bounds.height*6));if(!frame)frame=requestAnimationFrame(paint)})
 hero.addEventListener('pointerleave',reset)
 window.addEventListener('resize',()=>{bounds=null;reset()})
 window.addEventListener('scroll',()=>{bounds=null},{passive:true})
 media.addEventListener('change',()=>{if(media.matches){reset();home.querySelectorAll('.home-reveal').forEach(e=>e.classList.add('revealed'))}})
 if(media.matches)return
 home.classList.add('home-enter')
 const targets=home.querySelectorAll('.how-panel,.people-intro,.portrait-gallery figure')
 if(!('IntersectionObserver'in window))return
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target)}}},{threshold:.12})
 targets.forEach((e,i)=>{e.classList.add('home-reveal');e.style.setProperty('--reveal-delay',`${Math.max(0,i-2)*60}ms`);observer.observe(e)})
}
