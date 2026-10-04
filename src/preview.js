export function showPhoto(image, photoCanvas, overlayCanvas) {
  const width = image.naturalWidth
  const height = image.naturalHeight
  for (const canvas of [photoCanvas, overlayCanvas]) {
    canvas.width = width
    canvas.height = height
  }
  const context = photoCanvas.getContext('2d')
  if (!context) throw new Error('Your browser could not create the photo canvas.')
  context.drawImage(image, 0, 0)
}

export function clearLandmarks(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

export function drawLandmarks(canvas, detection) {
  clearLandmarks(canvas)
  const context = canvas.getContext('2d')
  const radius = Math.max(1, Math.min(canvas.width, canvas.height) / 450)
  for (const face of detection.faces) {
    context.fillStyle = face.index === 0 ? '#28dbbd' : '#ffbd66'
    context.beginPath()
    for (const point of face.pixelLandmarks) {
      context.moveTo(point.x + radius, point.y)
      context.arc(point.x, point.y, radius, 0, Math.PI * 2)
    }
    context.fill()
  }
}
