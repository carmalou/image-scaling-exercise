// note that this is written for a colorType of 0 -- all comments below should keep this in mind
function applyPixelFilter(filterType, bitDepth, currentRow, previousRow) {
  if (!previousRow) {
    console.log(`
      
      previousRow is undefined!!
      
      `)
  }
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
        let unfilteredPixels = []

        console.log(`
          
          case1 currenRow.length: ${currentRow.length}
          
          `)

        currentRow.forEach((value, i) => {
          // first byte is the filtertype, skip it
          if (i === 0) {
            return
          }

          if (i === 1) {
            unfilteredPixels.push(value)
            return
          }

          // perform look-behind
          unfilteredPixels.push(
            (value + unfilteredPixels[unfilteredPixels.length - 1]) % 256
          )
        })

        console.log(`
          
          unfilteredPixels length: ${unfilteredPixels.length}
          
          `)

        return unfilteredPixels
      }

      break

    case 2:
      if (bitDepth === 8) {
        let unfilteredPixels = []

        currentRow.forEach((value, i) => {
          // first byte is the filtertype, skip it
          if (i === 0) {
            return
          }

          const b = previousRow[i]

          unfilteredPixels.push((value + b) % 256)
        })

        return unfilteredPixels
      }

      break

    case 3:
      if (bitDepth === 8) {
        // average
        let unfilteredPixels = []

        currentRow.forEach((value, i) => {
          // first byte is the filtertype, skip it
          if (i === 0) {
            return
          }

          if (i === 1) {
            const b = previousRow[i]
            const avg = Math.floor(b / 2)

            unfilteredPixels.push((value + avg) % 256)

            return
          }

          // here we use the last added value to unfilteredPixels because it is our leftmost _unfiltered_ neighbor -- if we just looked one to the left, we would get a filtered value and it would cause our colors to be off
          const a = unfilteredPixels[unfilteredPixels.length - 1]
          const b = previousRow[i]

          const avg = Math.floor((a + b) / 2)

          unfilteredPixels.push((value + avg) % 256)
        })

        return unfilteredPixels
      }

      break

    case 4:
      if (bitDepth === 8) {
        // Paeth filter -- AKA the WORST ONE
        let unfilteredPixels = []

        currentRow.forEach((value, i) => {
          // first byte is the filtertype, skip it
          if (i === 0) {
            return
          }

          if (i === 1) {
            const b = previousRow[i]

            unfilteredPixels.push((value + b) % 256)

            return
          }

          // C is your top-left reference
          // B is your top reference
          // A is your left reference

          // here we use the last added value to unfilteredPixels because it is our leftmost _unfiltered_ neighbor -- if we just looked one to the left, we would get a filtered value and it would cause our colors to be off
          const a = unfilteredPixels[unfilteredPixels.length - 1]

          // here we can use the index because the complete previous row has been passed in
          const b = previousRow[i]
          const c = previousRow[i - 1]

          let difference = paeth(a, b, c)

          unfilteredPixels.push((value + difference) % 256)
        })

        return unfilteredPixels
      }

      break

    default:
      console.log(`
        UNHANDLED FILTER TYPE: ${filterType}
        `)
  }
}

function paeth(a, b, c) {
  // first find P -- that is your comparison
  const p = a + b - c

  // now that we have p as a comparison, we can find which initial value is closest to p
  // take the absolute value of the difference between p and the current value
  // compare that difference to the previous difference
  // if the new difference is lesser -- use it
  return [a, b, c].reduce((prev, curr) => {
    const difference = Math.abs(p - curr)

    if (difference < prev) {
      return curr
    }

    return prev
  }, Infinity)
}

module.exports = applyPixelFilter
