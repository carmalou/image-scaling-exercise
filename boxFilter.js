const fs = require('fs').promises
const generateBytes = require('./readInScanline.js')

async function main() {
  const { signature, pixelMap } = await generateBytes()

  const { height, width } = signature

  // pixelMap is an multi-dimensional array of bytes, each representing a 256bit value
  // we do not want to convert this to a flat array because then we have to deal with line-wraps, etc

  // for now, we will leave it as is, to make it easier to create our box grids
  // a box grid is a 2x2 grid of pixels. it spans 2 rows

  // first lets find the first four relevant bytes of the grayscale parrot image
  // A0, A1
  // B0, B1

  // A0: 0
  // A1: 0
  // B0: 0
  // B1: 0

  let pixelGrid = buildPixelGrid(pixelMap)

  let avgPixelVals = pixelGrid.map((row) => {
    return row.map((pixelGrid) => {
      let total = pixelGrid.reduce((prev, curr) => {
        return prev + curr
      }, 0)

      return Math.floor(total / pixelGrid.length)
    })
  })

  // now if i did this right, i should be able to create a pgm like before and it should at least have the same shape as the original image
  try {
    const pixels = Buffer.from(avgPixelVals?.flat())

    const header = `P5\n${width / 2} ${height / 2}\n255\n`
    const headerBuffer = Buffer.from(header, 'ascii')
    const outputBuffer = Buffer.concat([headerBuffer, pixels])

    await fs.writeFile(
      `output_images/scaled-by-half-output-${Date.now()}.pgm`,
      outputBuffer
    )
  } catch (err) {
    throw err
  }
}

function buildPixelGrid(arr) {
  let rowoffset = 0
  let transformedArr = []

  while (rowoffset < arr.length) {
    let colOffset = 0
    let currentRow = []

    while (colOffset < arr[rowoffset].length) {
      // create the grid
      currentRow.push([
        arr[rowoffset][colOffset],
        arr[rowoffset][colOffset + 1],
        arr[rowoffset + 1][colOffset],
        arr[rowoffset + 1][colOffset + 1],
      ])

      // move forward on the indices -- skipping the combined indices
      colOffset = colOffset + 2
    }

    // add row to accumulator
    transformedArr.push(currentRow)

    // move forward on the rows -- skipping the combined row
    rowoffset = rowoffset + 2
  }

  return transformedArr
}

main()
