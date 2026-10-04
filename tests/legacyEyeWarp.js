// Indices refer to the person's anatomical right/left, not the screen side.
export const EYE_LANDMARKS = [
  { name: 'right', corners: [33, 133], upper: [160, 159, 158], lower: [144, 145, 153], brow: [52, 65, 55] },
  { name: 'left', corners: [362, 263], upper: [385, 386, 387], lower: [380, 374, 373], brow: [285, 295, 282] },
]
export const MAX_EYE_STRENGTH = 0.12
// Upper bound exposed only to the local candidate-comparison test.
const MAX_COMPARISON_STRENGTH = 0.14
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
// A gentle midrange boost: f(t)=t+0.25t(1-t). Its derivative 1.25-0.5t
// stays positive and finite. 0→0, 50→0.0675, 100→0.12; no endpoint jumps.
export function sliderToStrength(value) {
  if (!Number.isFinite(Number(value))) return 0
  const t = clamp(Number(value), 0, 100) / 100
  return MAX_EYE_STRENGTH * (t + 0.25 * t * (1 - t))
}

/** Cache geometry once per detection, in original-image pixels. */
export function prepareEyeGeometry(landmarks, width, height) {
  const skip = reason => ({ eyes: [], reason })
  if (!Array.isArray(landmarks) || !Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
    return skip('Eye landmarks are missing or invalid. Eye adjustment is unavailable.')
  }
  const eyes = []
  for (const indices of EYE_LANDMARKS) {
    const required = [...indices.corners, ...indices.upper, ...indices.lower, ...indices.brow]
    if (!required.every(index => {
      const p = landmarks[index]
      return p && Number.isFinite(p.x) && Number.isFinite(p.y) && p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1
    })) return skip('Eye landmarks are missing or outside the photo. Try a clearer portrait.')
    const point = index => ({ x: landmarks[index].x * width, y: landmarks[index].y * height })
    const [a, b] = indices.corners.map(point)
    const eyeWidth = Math.hypot(b.x - a.x, b.y - a.y)
    if (eyeWidth < 6) return skip('The eyes are too small to adjust safely. Use a closer portrait.')
    const ux = (b.x - a.x) / eyeWidth
    const uy = (b.y - a.y) / eyeWidth
    const normal = p => (p.x - a.x) * -uy + (p.y - a.y) * ux
    const upper = indices.upper.map(point)
    const lower = indices.lower.map(point)
    const upperY = upper.reduce((sum, p) => sum + normal(p), 0) / upper.length
    const lowerY = lower.reduce((sum, p) => sum + normal(p), 0) / lower.length
    const eyeHeight = Math.abs(lowerY - upperY)
    if (eyeHeight / eyeWidth < 0.08 || eyeHeight / eyeWidth > 0.65) {
      return skip('Eye geometry is unreliable or the eyes are nearly closed. Try an open-eyed, frontal portrait.')
    }
    const offset = (upperY + lowerY) / 2
    const cx = (a.x + b.x) / 2 - uy * offset
    const cy = (a.y + b.y) / 2 + ux * offset
    const browDistance = Math.min(...indices.brow.map(point).map(p => Math.abs(normal(p) - offset)))
    const rx = eyeWidth * 0.85
    // Keep the vertical support below the eyebrow landmarks; this is a geometry
    // guard, not skin segmentation or a claim that occlusions can be recognized.
    const ry = Math.min(Math.max(eyeWidth * 0.32, eyeHeight * 1.05), browDistance * 0.8)
    if (ry < eyeHeight * 0.75) return skip('Too little room around the eyelids for a safe adjustment.')
    const extentX = Math.hypot(rx * ux, ry * uy)
    const extentY = Math.hypot(rx * uy, ry * ux)
    if (cx - extentX < 0 || cy - extentY < 0 || cx + extentX > width - 1 || cy + extentY > height - 1) {
      return skip('An eye is too close to the photo edge. Use an uncropped portrait.')
    }
    eyes.push({ name: indices.name, cx, cy, ux, uy, rx, ry, eyeWidth,
      bounds: { x0: Math.floor(cx - extentX), x1: Math.ceil(cx + extentX), y0: Math.floor(cy - extentY), y1: Math.ceil(cy + extentY) } })
  }
  const [a, b] = eyes
  const distance = Math.hypot(a.cx - b.cx, a.cy - b.cy)
  // Bounding circles guarantee non-overlap even when the two eyes tilt differently.
  if (distance <= Math.max(a.rx, a.ry) + Math.max(b.rx, b.ry) || Math.min(a.eyeWidth, b.eyeWidth) / Math.max(a.eyeWidth, b.eyeWidth) < 0.55) {
    return skip('The eye regions overlap or differ too much in size. Try a more frontal portrait.')
  }
  return { eyes, reason: null }
}

export function eyeRadius(x, y, eye) {
  const dx = x - eye.cx
  const dy = y - eye.cy
  return Math.hypot((dx * eye.ux + dy * eye.uy) / eye.rx, (-dx * eye.uy + dy * eye.ux) / eye.ry)
}

/** Destination → source inverse map. Inner core enlarges uniformly by 1+s.
 * For elliptical radius r in (0.5,1), use quintic smootherstep falloff:
 * t=2r-1; w=1-(6t^5-15t^4+10t^3); source=c+(destination-c)/(1+s*w).
 * w and its first two derivatives meet the constant core and unchanged exterior
 * smoothly. The source radius increases monotonically: no folds or holes.
 */
export function mapEyePixel(x, y, eye, strength) {
  const r = eyeRadius(x, y, eye)
  if (r >= 1) return { x, y }
  const t = Math.max(0, 2 * r - 1)
  const weight = 1 - t * t * t * (t * (6 * t - 15) + 10)
  const scale = 1 / (1 + clamp(strength, 0, MAX_COMPARISON_STRENGTH) * weight)
  return { x: eye.cx + (x - eye.cx) * scale, y: eye.cy + (y - eye.cy) * scale }
}

// Premultiplied-alpha bilinear sampling avoids dark fringes in transparent PNGs.
// All four taps are clamped, including the last row/column.
export function sampleBilinear(source, x, y, destination, offset) {
  x = clamp(x, 0, source.width - 1)
  y = clamp(y, 0, source.height - 1)
  const x0 = Math.floor(x), y0 = Math.floor(y)
  const x1 = Math.min(x0 + 1, source.width - 1), y1 = Math.min(y0 + 1, source.height - 1)
  const fx = x - x0, fy = y - y0
  const taps = [(y0 * source.width + x0) * 4, (y0 * source.width + x1) * 4, (y1 * source.width + x0) * 4, (y1 * source.width + x1) * 4]
  const weights = [(1 - fx) * (1 - fy), fx * (1 - fy), (1 - fx) * fy, fx * fy]
  let alpha = 0, red = 0, green = 0, blue = 0
  for (let i = 0; i < 4; i++) {
    const tap = taps[i]
    const weightedAlpha = source.data[tap + 3] * weights[i]
    alpha += weightedAlpha
    red += source.data[tap] * weightedAlpha
    green += source.data[tap + 1] * weightedAlpha
    blue += source.data[tap + 2] * weightedAlpha
  }
  destination[offset] = alpha ? red / alpha : 0
  destination[offset + 1] = alpha ? green / alpha : 0
  destination[offset + 2] = alpha ? blue / alpha : 0
  destination[offset + 3] = alpha
}

/** source is read-only by convention; output is a separate reusable pixel buffer.
 * It must initially contain the original. Only the cached eye bounds are written,
 * including on strength zero, so successive renders cannot accumulate changes.
 */
export function applyEyeWarp(source, output, eyes, uiValue) {
  return applyEyeWarpStrength(source, output, eyes, sliderToStrength(uiValue))
}

// Same deformation implementation for controlled comparisons with fixed geometry.
export function applyEyeWarpStrength(source, output, eyes, requestedStrength) {
  if (source.data === output.data || source.data.buffer === output.data.buffer) throw new Error('Eye warp requires a separate output buffer.')
  if (source.width !== output.width || source.height !== output.height || source.data.length !== output.data.length) throw new Error('Image sizes must match.')
  const strength = Number.isFinite(requestedStrength) ? clamp(requestedStrength, 0, MAX_COMPARISON_STRENGTH) : 0
  for (const eye of eyes) {
    const { x0, x1, y0, y1 } = eye.bounds
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const offset = (y * source.width + x) * 4
        if (!strength || eyeRadius(x, y, eye) >= 1) {
          for (let c = 0; c < 4; c++) output.data[offset + c] = source.data[offset + c]
        } else {
          const mapped = mapEyePixel(x, y, eye, strength)
          sampleBilinear(source, mapped.x, mapped.y, output.data, offset)
        }
      }
    }
  }
  return output
}
