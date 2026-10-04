const report = document.querySelector('#report')
const frame = document.querySelector('#app-frame')
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const equal = (a, b) => a.length === b.length && a.every((v, i) => v === b[i])
const check = (condition, message) => { if (!condition) throw new Error(message); report.textContent += `\nPASS: ${message}` }

document.querySelector('#fixture').addEventListener('change', async event => {
  const file = event.target.files[0]
  if (!file) return
  event.target.disabled = true
  report.textContent = 'Running on the real application…'
  document.querySelector('#crops').replaceChildren()
  try {
    const doc = frame.contentDocument
    const win = frame.contentWindow
    const transfer = new DataTransfer()
    transfer.items.add(file)
    doc.querySelector('#file').files = transfer.files
    doc.querySelector('#file').dispatchEvent(new win.Event('change', { bubbles: true }))
    const slider = doc.querySelector('#eye-strength')
    const deadline = performance.now() + 90000
    while (slider.disabled) {
      if (performance.now() > deadline) throw new Error(`Editing unavailable: ${doc.querySelector('#edit-status').textContent}; ${doc.querySelector('#model-status').textContent}`)
      await pause(100)
    }
    const original = doc.querySelector('#photo'), edited = doc.querySelector('#edited')
    const read = canvas => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
    const pristine = read(original)
    check(original.width === edited.width && original.height === edited.height, `Equal original/output dimensions: ${original.width} × ${original.height}`)
    check(equal(pristine, read(edited)), 'Initial strength zero is pixel-identical')
    async function render(value) {
      slider.value = String(value)
      slider.dispatchEvent(new win.Event('input', { bubbles: true }))
      await new Promise(resolve => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve)))
      check(doc.querySelector('#edited-caption').textContent.endsWith(String(value)), `UI rendered strength ${value}`)
      return read(edited)
    }
    const detailOriginal = doc.querySelector('#eye-original')
    const detailEdited = doc.querySelector('#eye-edited')
    const pristineDetail = read(detailOriginal)
    check(detailOriginal.width === detailEdited.width && detailOriginal.height === detailEdited.height, 'Detail crops have identical pixel dimensions')
    check(equal(pristineDetail, read(detailEdited)), 'Detail crops match at zero')
    const at50 = await render(50)
    check(!equal(pristineDetail, read(detailEdited)), 'Detail shows genuine changes at 50')
    check(!equal(pristine, at50), 'Strength 50 changes real canvas pixels')
    await render(20)
    check(equal(pristine, await render(0)), '0 → 50 → 20 → 0 restores exact original canvas pixels')
    const maximum = await render(100)
    check(equal(maximum, await render(100)), 'Repeated maximum strength is deterministic')
    check(equal(pristine, read(original)), 'Original canvas remains unchanged')
    const detailAt100 = read(detailEdited)
    const overlay = doc.querySelector('#show-landmarks')
    overlay.checked = true
    overlay.dispatchEvent(new win.Event('change'))
    check(equal(detailAt100, read(detailEdited)) && equal(pristineDetail, read(detailOriginal)), 'Landmark overlay does not contaminate detail crops')
    doc.querySelector('#reset-eye').click()
    await new Promise(resolve => win.requestAnimationFrame(() => win.requestAnimationFrame(resolve)))
    check(slider.value === '0' && equal(pristine, read(edited)), 'Reset button restores exact original pixels and value zero')
    check(equal(pristineDetail, read(detailEdited)), 'Reset restores exact original detail pixels')
    await render(100)
    let minX = original.width, minY = original.height, maxX = 0, maxY = 0, changed = 0
    for (let i = 0; i < pristine.length; i += 4) {
      if (pristine[i] !== maximum[i] || pristine[i+1] !== maximum[i+1] || pristine[i+2] !== maximum[i+2] || pristine[i+3] !== maximum[i+3]) {
        const x = (i / 4) % original.width, y = Math.floor(i / 4 / original.width)
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); changed++
      }
    }
    check(changed > 0, `Maximum strength changes ${changed} pixels`)
    const padding = Math.ceil((maxX - minX) * .15)
    minX = Math.max(0, minX - padding); minY = Math.max(0, minY - padding)
    maxX = Math.min(original.width - 1, maxX + padding); maxY = Math.min(original.height - 1, maxY + padding)
    for (const [label, source] of [['Original eye area', original], ['Edited eye area · strength 100', edited]]) {
      const figure = document.createElement('figure'), caption = document.createElement('figcaption'), canvas = document.createElement('canvas')
      caption.textContent = label
      canvas.width = (maxX - minX + 1) * 3; canvas.height = (maxY - minY + 1) * 3
      canvas.getContext('2d').drawImage(source, minX, minY, maxX-minX+1, maxY-minY+1, 0, 0, canvas.width, canvas.height)
      figure.append(caption, canvas); document.querySelector('#crops').append(figure)
    }
    report.textContent += '\nComplete. Inspect the crops visually; numerical checks do not prove naturalness.'
  } catch (error) {
    report.textContent += `\nFAIL / BLOCKED: ${error.message}`
  } finally { event.target.disabled = false }
})

// Optional public fixture fetched only by an explicit test-page action.
document.querySelector('#public-sample').addEventListener('click', async () => {
  try {
    const response = await fetch('https://storage.googleapis.com/mediapipe-assets/portrait.jpg')
    if (!response.ok) throw new Error('Sample download failed')
    const transfer = new DataTransfer()
    transfer.items.add(new File([await response.blob()], 'public-test-portrait.jpg', { type: 'image/jpeg' }))
    const input = document.querySelector('#fixture')
    input.files = transfer.files
    input.dispatchEvent(new Event('change'))
  } catch (error) { report.textContent = error.message }
})
