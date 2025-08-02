// note that this is written for a colorType of 0 -- all comments below should keep this in mind
function applyPixelFilter(filterType, bitDepth, currentRow) {
  switch (filterType) {
    case 0:
      if (bitDepth < 8) {
        // in this case we are dealing with pixel packing. in modern pngs its probably nearly always "how many bytes in this pixel" but in grayscale + filterType of 0 its "how many pixels in this byte"

        // the byte needs to be transformed to binary and mapped over

        // 0 - black
        // 1 - white

        return parseInt(row[i]).toString(2).padStart(8, '0').split('')
      }

      break

    // in this case, we are looking to the left to find the value
    case 1:
      // if the bitDepth is 8, each byte is a pixel
      // meaning given a value of 255, you could expand this out to rbg 255,255,255
      if (bitDepth === 8) {
        return currentRow.map((value, i) => {
          if (i === 0) {
            return value
          }

          // perform look-behind
          return value + (currentRow[i - 1] % 256)
        })
      }

      break

    default:
      console.log(`
        UNHANDLED FILTER TYPE: ${filterType}
        `)
  }
}

module.exports = applyPixelFilter
