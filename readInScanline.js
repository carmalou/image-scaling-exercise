const fs = require('fs')
const zlib = require('zlib')

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

    if (chunkName == 'IDAT') {
      idatBuffers.push(chunkData)
      futureBufLength += chunkLength
    }

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

main()
