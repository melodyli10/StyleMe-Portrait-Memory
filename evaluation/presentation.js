// Guided presentation only. Protocol validation, scores and mapping stay in lab.js/protocol.js.
let stage=0,lastMilestone=-1
const $=id=>document.getElementById(id)
function show(){
 document.querySelectorAll('[data-stage-panel]').forEach(n=>n.hidden=Number(n.dataset.stagePanel)!==stage)
 document.querySelectorAll('[data-stage]').forEach(n=>{const active=Number(n.dataset.stage)===stage;n.setAttribute('aria-current',active?'step':'false');n.classList.toggle('active',active)})
}
document.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{stage=Number(b.dataset.stage);show()})
export function updatePresentation(session,busy){
 const completed=session?.cases.filter(c=>['scored','skipped','failed'].includes(c.status)).length||0
 const milestone=!session?0:session.finalizedAt?3:completed===10?2:1
 if(milestone!==lastMilestone){stage=milestone;lastMilestone=milestone}
 $('lab-progress').textContent=session?`${completed} of 10 cases complete${session.finalizedAt?' · finalized':' · methods concealed'}`:'Start with five confirmed teaching photos and ten held-out portraits.'
 $('lab-meter').value=completed
 $('lab-meter').hidden=!session
 $('lab-meter').setAttribute('aria-label','Completed evaluation cases')
 document.querySelectorAll('[data-stage]').forEach(b=>b.disabled=busy||(!session&&Number(b.dataset.stage)>0)||(Number(b.dataset.stage)===3&&completed!==10))
 $('lock').hidden=Boolean(session)
 $('review-list').replaceChildren()
 if(session)for(const c of session.cases){
  const row=document.createElement('article'),title=document.createElement('strong'),detail=document.createElement('p')
  title.textContent=`${c.id} · ${c.status}`
  detail.textContent=['skipped','failed'].includes(c.status)?c.skipReason||'See locked record.':Object.entries(c.results).map(([label,r])=>`${label}: ${r.correctionCount} correction(s)${r.artifacts?` · ${r.artifacts}`:''}`).join(' / ')||'Not yet scored.'
  row.append(title,detail);$('review-list').append(row)
 }
 $('review-next').disabled=completed!==10
 $('final-state').textContent=session?.finalizedAt?'Finalized. Scores are immutable. You can export your actual records.':'Finalizing reveals method identities and permanently locks the session.'
 show()
}
$('review-next').onclick=()=>{stage=3;show()}
