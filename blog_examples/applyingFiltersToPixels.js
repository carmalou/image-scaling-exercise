const colorChannelMatrix = {
  0: 1,
  2: 3,
  3: 1,
  4: 2,
  6: 4,
}

function parsePixels(signature, pixels) {
  const { height, width, colorType, bitDepth } = signature

  // the product of the colorType and bitDepth determines the bits per pixel
  let bitsPerPixel = colorChannelMatrix[colorType] * bitDepth

  // using the derived bits per pixel * width, find the bits per row / scanline
  let bitsPerRow = bitsPerPixel * width

  // finally divide that by 8 to find the bytes per row
  let bytesPerRow = Math.ceil(bitsPerRow / 8)

  const numScanlines = height
  let currentScanline = 0
  const scanlineLength = bytesPerRow + 1 // add one for the filterByte

  // a matrix containing pixel values per row
  const pixelMap = []

  while (currentScanline < numScanlines) {
    let startingOffset =
      currentScanline === 0 ? 0 : currentScanline * scanlineLength
    currentScanline++

    // first, slice the scanline
    let row = pixels.subarray(startingOffset, startingOffset + scanlineLength)

    // find the filter type and set the offset
    let filterType = row[0]

    const parsedRow = applyPixelFilter(
      filterType,
      bitDepth,
      row.slice(1),
      pixelMap[pixelMap.length - 1]
    )

    if (parsedRow?.length) {
      pixelMap.push(parsedRow)
    }

    continue
  }

  return {
    signature,
    pixelMap,
  }
}
