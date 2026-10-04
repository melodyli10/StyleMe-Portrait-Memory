import { applyEyeWarp, prepareEyeGeometry } from './eyeWarp.js'
import { applyFaceWarp, prepareFaceGeometry } from './faceWarp.js'

// Original → face slimming → eye enlargement → output. Face support and source
// samples stay below eye write bounds + interpolation margin. The stages are
// disjoint, so both can read pristine pixels without moving the eye landmarks
// or resampling an already edited area. Future overlapping stages must compose
// coordinate maps explicitly; this separation must not be assumed for them.
export function createImagePipeline(original, landmarks) {
  const geometry = prepareEyeGeometry(landmarks, original.width, original.height)
  const faceGeometry = prepareFaceGeometry(landmarks, original.width, original.height, geometry.eyes, original)
  const output = { width: original.width, height: original.height, data: new Uint8ClampedArray(original.data) }
  const dirtyBounds = [...(faceGeometry.bounds ? [faceGeometry.bounds] : []), ...geometry.eyes.map(eye=>eye.bounds)]
  return {
    geometry, faceGeometry, output, dirtyBounds,
    render(eyeValue, faceValue = 0) {
      applyFaceWarp(original, output, faceGeometry, faceValue)
      return applyEyeWarp(original, output, geometry.eyes, eyeValue)
    },
  }
}
