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
    // keep reference to initial offset
    let startingOffset = currentScanline

    // increment row offset
    currentScanline++

    // slice the scanline
    let row = pixels.subarray(startingOffset, startingOffset + scanlineLength)
    let filteredRow = []

    // find the filter type and set the offset
    let filterType = row[0]

    // set the offset to 1 to skip the filter type value
    let offset = 1

    // loop over the row itself
    while (offset < row.length) {
      let i = offset

      // log out the current pixel's value
      console.log(row[i])

      offset++
    }

    return {
      signature,
      pixelMap,
    }
  }
}
