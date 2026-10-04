import { adaptiveProfileEye } from './styleProfile.js'
import { preferenceValues } from './preferences.js'

// Both modes share mandatory warp safety. Adaptive can use the profile's
// evidence-gated eye rule; without sufficient evidence it uses fixed strengths.
// Every resolution is pure: confirmed examples/preferences are never rewritten.
export function resolveRememberedStyle(saved, pipeline, mode='adaptive', includeFace=false, profile=null) {
  if(!['fixed','adaptive'].includes(mode))throw new Error('Unknown comparison mode.')
  const preferences=preferenceValues(saved)
  const applied={eye:0,face:0},notes=[]
  if(!pipeline)return {saved:preferences,applied,mode,notes:['No usable single-face detection. Edits skipped.']}
  if(pipeline.geometry.reason || pipeline.geometry.eyes.length!==2)notes.push(`Eye edit skipped: ${pipeline.geometry.reason || 'Invalid eye geometry.'}`)
  else applied.eye=preferences.eye
  if(!includeFace)notes.push('Face slimming excluded: opt in for this photo to apply its saved strength.')
  else if(pipeline.faceGeometry.reason || pipeline.faceGeometry.sides.length!==2)notes.push(`Face edit skipped: ${pipeline.faceGeometry.reason || 'Invalid contour geometry.'}`)
  else {
    applied.face=preferences.face
    if(applied.face && pipeline.faceGeometry.warning)notes.push(pipeline.faceGeometry.warning)
    if(applied.face)notes.push('Face warp retains its existing spatial safety limits in both modes; see the face status for its effective coefficient.')
  }
  if(mode==='adaptive' && profile?.examples.length && applied.eye===preferences.eye && !pipeline.geometry.reason){
    const adaptation=adaptiveProfileEye(profile,pipeline)
    applied.eye=adaptation.eye
    notes.push(adaptation.reason)
  }
  notes.push(mode==='fixed'
    ? 'Fixed Preset: saved slider strengths unchanged where eligible; mandatory algorithm safety checks still apply.'
    : profile?.examples.length ? 'StyleMe Adaptive uses this photo’s valid geometry and the teaching evidence described above.' : 'StyleMe Adaptive: fitted to this photo’s landmarks. No additional strength adaptation is justified by the current measurements; eligible saved strengths are unchanged.')
  return {saved:preferences,applied,mode,notes}
}
