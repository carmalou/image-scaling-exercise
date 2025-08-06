function parsePng(data) {
  let width
  let height
  let bitDepth
  let colorType
  let compression
  let filter
  let interlace

  // loop over the data
  // first handle for the signature
  let i = 8

  while (i < data.length) {
    let chunkLength = data.readUInt32BE(i)
    let chunkName = data.toString('ascii', i + 4, i + 8)

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

    i = i + chunkLength + 12
  }

  return {
    width,
    height,
    bitDepth,
    colorType,
    compression,
    filter,
    interlace,
  }
}
