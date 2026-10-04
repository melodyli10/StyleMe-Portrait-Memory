// The scoring UI receives no method name and never renders initial strength.
export function scoringPanel({label,pixels,initialEye,done,pipeline,onScore,onError}){
 const panel=document.createElement('div')
 panel.innerHTML=`<h3>Output ${label}</h3><canvas aria-label="Anonymous output ${label}"></canvas><p>${done?'Score locked.':'Inspect against your locked acceptance criteria.'}</p><label><input type="checkbox" class="correct"> Eye adjustment required</label><label>Final accepted eye setting <input type="number" class="accepted" min="0" max="100" step="1" placeholder="0–100"></label><button class="preview">Preview correction</button><button class="restore">Restore anonymous result</button><label>Visible artifacts (no identifying details)<textarea class="artifacts"></textarea></label><button class="score">Lock this score</button>`
 const paint=value=>{const c=panel.querySelector('canvas');c.width=value.width;c.height=value.height;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(value.data),value.width,value.height),0,0)}
 const lock=()=>panel.querySelectorAll('input,textarea,button').forEach(e=>e.disabled=true)
 paint(pixels)
 if(done){lock();return panel}
 let previewed=false,lastPreview=null
 panel.querySelector('.preview').onclick=()=>{try{
  const input=panel.querySelector('.accepted');if(input.value===''||!input.checkValidity())throw new Error('Enter an integer from 0 to 100.')
  panel.querySelector('.correct').checked=true;paint(pipeline.render(Number(input.value),0));previewed=true;lastPreview=Number(input.value)
 }catch(e){onError(e.message)}}
 panel.querySelector('.restore').onclick=()=>{paint(pixels);previewed=false;lastPreview=null;panel.querySelector('.accepted').value='';panel.querySelector('.correct').checked=false}
 panel.querySelector('.score').onclick=()=>{try{
  const correction=panel.querySelector('.correct').checked,input=panel.querySelector('.accepted')
  if(correction&&(input.value===''||!input.checkValidity()))throw new Error('A corrected result needs an accepted integer setting from 0 to 100.')
  if(correction&&(!previewed||lastPreview!==Number(input.value)))throw new Error('Preview the final correction before locking its score.')
  if(correction&&Number(input.value)===initialEye)throw new Error('This is the unchanged setting. Restore the anonymous result and record no correction.')
  if(!correction&&(previewed||input.value!==''))throw new Error('Restore the anonymous result or record the correction.')
  onScore({correction,accepted:correction?Number(input.value):initialEye,artifacts:panel.querySelector('.artifacts').value})
  lock();panel.querySelector('p').textContent='Score locked.'
 }catch(e){onError(e.message)}}
 return panel
}
