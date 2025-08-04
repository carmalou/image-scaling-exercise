// in this file, we will run the scanline file and save its output a file
// if this image is comparable to the original, we succeeded

const fs = require('fs').promises
const generateBytes = require('./readInScanline.js')

async function main() {
  try {
    const { signature, pixelMap } = await generateBytes()

    const { height, width } = signature
    const pixels = Buffer.from(pixelMap?.flat())

    const header = `P5\n${width} ${height}\n255\n`
    const headerBuffer = Buffer.from(header, 'ascii')
    const outputBuffer = Buffer.concat([headerBuffer, pixels])

    await fs.writeFile(`output_images/output-${Date.now()}.pgm`, outputBuffer)
  } catch (err) {
    throw err
  }
}

main()
