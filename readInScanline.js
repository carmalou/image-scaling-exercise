const fs = require('fs')
const zlib = require('zlib')
const applyPixelFilter = require('./filterTypes.js')

const colorChannelMatrix = {
  0: 1,
  2: 3,
  3: 1,
  4: 2,
  6: 4,
}

function main() {
  fs.readFile('sample_images/grayscale-parrot.png', (err, data) => {
    if (err) {
      console.error(err)

      return
    }

    const { signature, pixelBytes } = parsePng(data)

    console.log(`
      
      signature: ${JSON.stringify(signature, null, 2)}
      
      `)

    parsePixels(signature, pixelBytes)
  })
}

function parsePng(data) {
  let width
  let height
  let bitDepth
  let colorType
  let compression
  let filter
  let interlace

  let idatBuffers = []

  // loop over the data
  // first handle for the signature
  let i = 8
  let futureBufLength = 0

  while (i < data.length) {
    let chunkLength = data.readUInt32BE(i)
    let chunkName = data.toString('ascii', i + 4, i + 8)
    let chunkData = data.subarray(i + 8, i + 8 + chunkLength)

    // get and set the signature
    if (chunkName == 'IHDR') {
      let ihdr = i + 8
      width = data.readUInt32BE(ihdr)
      height = data.readUInt32BE(ihdr + 4)
      bitDepth = data[ihdr + 8]
      colorType = data[ihdr + 9]
      compression = data[ihdr + 10]
      filter = data[ihdr + 11]
      interlace = data[ihdr + 12]
    }

    // get each chunk of pixels
    if (chunkName == 'IDAT') {
      idatBuffers.push(chunkData)
      futureBufLength += chunkLength
    }

    // signifies the end of the file
    // since we are all the way through the file, return the signature and pixels
    if (chunkName == 'IEND') {
      const pixel = Buffer.concat(idatBuffers, futureBufLength)

      try {
        let decompressed = zlib.inflateSync(pixel)

        return {
          signature: {
            width,
            height,
            bitDepth,
            colorType,
            compression,
            filter,
            interlace,
          },
          pixelBytes: decompressed,
        }
      } catch (err) {
        console.error('Failed to decompress:', err)
        return
      }
    }

    i = i + chunkLength + 12
  }
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

  console.log(`
    
    bitsPerPixel: ${bitsPerPixel}
    bitsPerRow: ${bitsPerRow}
    bytesPerRow: ${bytesPerRow}
    numScanlines: ${numScanlines}
    scanline length: ${scanlineLength}
    
    `)

  // a matrix containing pixel values per row
  const pixelMap = []

  while (currentScanline < numScanlines) {
    let transformedRow = []
    let startingOffset =
      currentScanline === 0 ? 0 : currentScanline * scanlineLength
    currentScanline++

    console.log(`
      
      startingoffset: ${startingOffset}
      
      `)

    // first, slice the scanline
    let row = pixels.subarray(startingOffset, startingOffset + scanlineLength)

    console.log(`
      
      row.length: ${row.length}
      
      `)

    // find the filter type and set the offset
    let filterType = row[0]
    let offset = 1

    console.log(`
      
      pixelMap.length: ${pixelMap.length}
      pixelMap[pixelMap.length-1]: ${pixelMap[pixelMap.length - 1]}
      
      `)

    // since we're doing the whole row at once, i don't think we need the while loop below anymore
    const parsedRow = applyPixelFilter(
      filterType,
      bitDepth,
      row,
      pixelMap[pixelMap.length - 1]
    )

    if (!parsedRow) {
      console.log(`
        
        filterType: ${filterType}
        currentScanline: ${currentScanline}
        
        `)
    }

    if (parsedRow?.length) {
      console.log('length ', parsedRow.length)
      console.log(parsedRow[0])
      console.log(parsedRow[50])
      console.log(parsedRow[75])
      console.log(parsedRow[149])

      pixelMap.push(parsedRow)
    }

    // loop over the row itself
    // while (offset < row.length) {
    //   let i = offset
    //   offset++

    //   const parsedRow = applyPixelFilter(filterType, bitDepth, row)

    //   if (parsedRow?.length) {
    //     console.log('length ', parsedRow.length)
    //     console.log(parsedRow[0])
    //     console.log(parsedRow[50])
    //     console.log(parsedRow[75])
    //     console.log(parsedRow[149])
    //   }

    //   transformedRow.push(applyPixelFilter(filterType, bitDepth, row))
    // }

    // pixelMap.push(transformedRow)

    continue
  }
}

main()
