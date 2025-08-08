const zlib = require('zlib')

function parsePng(data) {
  let width
  let height
  let bitDepth
  let colorType
  let compression
  let filter
  let interlace

  // this will hold the pixel bytes as we pull them from the image
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
