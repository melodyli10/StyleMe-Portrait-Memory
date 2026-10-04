import { adaptiveProfileEye, profilePreferences } from './styleProfile.js'
import { preferenceValues } from './preferences.js'

// Both modes share mandatory warp safety. Adaptive can use the profile's
// evidence-gated eye rule; without sufficient evidence it uses profile medians.
// Every resolution is pure: confirmed examples/preferences are never rewritten.
export function resolveRememberedStyle(saved, pipeline, mode='adaptive', includeFace=false, profile=null, fixedBaseline='first-example') {
  if(!['fixed','adaptive'].includes(mode))throw new Error('Unknown comparison mode.')
  const first=profile?.examples?.[0]
  const valid=value=>Number.isInteger(value)&&value>=0&&value<=100
  const preferences=preferenceValues(mode==='fixed'&&first&&fixedBaseline==='first-example'
    ? {eye:valid(first.eye)?first.eye:0,face:valid(first.face)?first.face:0}
    : profilePreferences(profile)||saved)
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
    ? first&&fixedBaseline==='first-example' ? 'Fixed Preset: first confirmed setup photo’s strengths, unchanged across portraits; mandatory safety checks still apply.' : 'Fixed Preset: legacy saved strengths; mandatory safety checks still apply.'
    : profile?.examples.length ? 'StyleMe Adaptive uses this photo’s valid geometry and the teaching evidence described above.' : 'StyleMe Adaptive: fitted to this photo’s landmarks. No additional strength adaptation is justified by the current measurements; eligible saved strengths are unchanged.')
  return {saved:preferences,applied,mode,notes}
}
