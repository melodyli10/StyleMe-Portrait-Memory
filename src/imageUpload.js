const MAX_BYTES = 30 * 1024 * 1024
const MAX_PIXELS = 24_000_000

export async function decodePhoto(file) {
  if (!file.size) throw new Error('This file is empty. Choose a JPG or PNG photo.')
  if (file.size > MAX_BYTES) throw new Error('Choose a photo smaller than 30 MB.')
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const isPng = [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)
  // Inspect file bytes; a filename or browser MIME label alone is not enough.
  if (!isJpeg && !isPng) throw new Error('Unsupported file. Choose a real JPG, JPEG or PNG image.')
  const url = URL.createObjectURL(file)
  const image = new Image()
  try {
    image.src = url
    await image.decode()
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Empty image')
    if (image.naturalWidth * image.naturalHeight > MAX_PIXELS || Math.max(image.naturalWidth, image.naturalHeight) > 8192) {
      throw new RangeError('This photo is too large. Use up to 24 megapixels and 8192 pixels per side.')
    }
    return image
  } catch (error) {
    if (error instanceof RangeError) throw error
    throw new Error('This image could not be read. It may be corrupted; try another JPG or PNG.')
  } finally {
    URL.revokeObjectURL(url)
  }
}
