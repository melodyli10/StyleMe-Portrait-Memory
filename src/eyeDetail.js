// One fixed rectangle per photo, shared by both views at every strength.
export function getEyeDetailCrop(eyes, width, height) {
  if (!eyes?.length) return null
  const padding = Math.ceil(Math.max(...eyes.map(eye => eye.eyeWidth)) * 0.35)
  const x = Math.max(0, Math.min(...eyes.map(eye => eye.bounds.x0)) - padding)
  const y = Math.max(0, Math.min(...eyes.map(eye => eye.bounds.y0)) - padding)
  const right = Math.min(width, Math.max(...eyes.map(eye => eye.bounds.x1)) + padding + 1)
  const bottom = Math.min(height, Math.max(...eyes.map(eye => eye.bounds.y1)) + padding + 1)
  return { x, y, width: right - x, height: bottom - y }
}

export function drawEyeDetail(sourceCanvas, detailCanvas, crop) {
  if (detailCanvas.width !== crop.width || detailCanvas.height !== crop.height) {
    detailCanvas.width = crop.width
    detailCanvas.height = crop.height
  }
  // Copy real source pixels 1:1, never the separate landmark overlay.
  const pixels = sourceCanvas.getContext('2d').getImageData(crop.x, crop.y, crop.width, crop.height)
  detailCanvas.getContext('2d').putImageData(pixels, 0, 0)
}
