import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import simdLoader from '@mediapipe/tasks-vision/vision_wasm_internal.js?url'
import simdBinary from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url'
import fallbackLoader from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.js?url'
import fallbackBinary from '@mediapipe/tasks-vision/vision_wasm_nosimd_internal.wasm?url'

// The WASM assets come from the same installed package as the JavaScript API.
export const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
let modelPromise

export function loadFaceDetector() {
  if (!modelPromise) {
    modelPromise = createDetector().catch((error) => {
      modelPromise = null // Allow an explicit retry after a failed download.
      throw error
    })
  }
  return modelPromise
}

async function createDetector() {
  const simd = await FilesetResolver.isSimdSupported()
  const response = await fetch(MODEL_URL, { signal: AbortSignal.timeout(60000) })
  if (!response.ok) throw new Error(`Model download failed (${response.status}).`)
  const modelAssetBuffer = new Uint8Array(await response.arrayBuffer())
  return FaceLandmarker.createFromOptions({
    wasmLoaderPath: simd ? simdLoader : fallbackLoader,
    wasmBinaryPath: simd ? simdBinary : fallbackBinary,
  }, {
    baseOptions: { modelAssetBuffer, delegate: 'CPU' },
    runningMode: 'IMAGE',
    // Two is a guard for group photos; this prototype accepts one face only.
    numFaces: 2,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  })
}

export function detectFaces(detector, canvas) {
  const result = detector.detect(canvas)
  return {
    width: canvas.width,
    height: canvas.height,
    faces: result.faceLandmarks.map((landmarks, index) => ({
      index,
      normalizedLandmarks: landmarks.map(({ x, y, z }) => ({ x, y, z })),
      // x/y are image pixels. z remains relative depth, not millimeters.
      pixelLandmarks: landmarks.map(({ x, y }) => ({ x: x * canvas.width, y: y * canvas.height })),
    })),
  }
}
