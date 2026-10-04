// Anonymous scoring. Initial strengths and method identity are never displayed.
// Existing version-1 sessions retain their original eye-only scoring contract.
export function scoringPanel({label,pixels,initialEye,initialFace=0,twoDimensions=false,done,pipeline,onScore,onError}){
 const panel=document.createElement('div')
 const field=(key,name)=>`<fieldset><legend>${name}</legend><label><input type="checkbox" class="${key}-correct"> Further adjustment required</label><label>Final accepted setting <input type="number" class="${key}-accepted" min="0" max="100" step="1" placeholder="0–100"></label></fieldset>`
 panel.innerHTML=`<h3>Output ${label}</h3><canvas aria-label="Anonymous output ${label}"></canvas><p>${done?'Score locked.':'Inspect against your locked acceptance criteria.'}</p>${field('eye','Eye Enlargement')}${twoDimensions?field('face','Face Slimming'):''}<button class="preview">Preview correction</button><button class="restore">Restore anonymous result</button><label>Visible artifacts (no identifying details)<textarea class="artifacts"></textarea></label><button class="score">Lock this score</button>`
 const paint=value=>{const c=panel.querySelector('canvas');c.width=value.width;c.height=value.height;c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(value.data),value.width,value.height),0,0)}
 const lock=()=>panel.querySelectorAll('input,textarea,button').forEach(e=>e.disabled=true)
 paint(pixels);if(done){lock();return panel}
 let lastPreview=null
 const read=()=>{
  const values={eye:initialEye,face:initialFace},corrections={eye:false,face:false}
  for(const key of twoDimensions?['eye','face']:['eye']){
   const checked=panel.querySelector(`.${key}-correct`).checked,input=panel.querySelector(`.${key}-accepted`)
   if(checked){if(input.value===''||!input.checkValidity()||!Number.isInteger(Number(input.value)))throw Error('Enter an accepted integer from 0 to 100 for each correction.');values[key]=Number(input.value);if(values[key]===(key==='eye'?initialEye:initialFace))throw Error('Unchanged setting: restore it and record no correction.')}
   else if(input.value!=='')throw Error('Clear the unscored setting or mark it as requiring correction.')
   corrections[key]=checked
  }
  return {values,corrections}
 }
 panel.querySelector('.preview').onclick=()=>{try{const {values,corrections}=read();if(!corrections.eye&&!corrections.face)throw Error('Select the setting requiring correction first.');paint(pipeline.render(values.eye,values.face));lastPreview=JSON.stringify(values)}catch(e){onError(e.message)}}
 panel.querySelector('.restore').onclick=()=>{paint(pixels);lastPreview=null;panel.querySelectorAll('input').forEach(n=>{if(n.type==='checkbox')n.checked=false;else n.value=''})}
 panel.querySelector('.score').onclick=()=>{try{
  const {values,corrections}=read(),changed=corrections.eye||corrections.face
  if(changed&&lastPreview!==JSON.stringify(values))throw Error('Preview the final corrections before locking.')
  if(!changed&&lastPreview!==null)throw Error('Restore the anonymous output before recording no corrections.')
  onScore({correction:corrections.eye,accepted:values.eye,...(twoDimensions?{faceCorrection:corrections.face,faceAccepted:values.face}:{}),artifacts:panel.querySelector('.artifacts').value})
  lock();panel.querySelector('p').textContent='Score locked.'
 }catch(e){onError(e.message)}}
 return panel
}
