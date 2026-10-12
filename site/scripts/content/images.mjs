/** Intrinsic dimensions of the legacy JPEG, PNG, and SVG asset formats. */
export function imageDimensions(bytes, filename) {
  if (filename.endsWith('.png')) {
    if (bytes.subarray(1, 4).toString() !== 'PNG') throw new Error(`Invalid PNG: ${filename}`);
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (filename.endsWith('.svg')) {
    const text = bytes.toString('utf8');
    const box = text.match(/viewBox=["']\s*[\d.-]+[ ,]+[\d.-]+[ ,]+([\d.]+)[ ,]+([\d.]+)\s*["']/);
    if (!box) throw new Error(`SVG without viewBox: ${filename}`);
    return { width: Number(box[1]), height: Number(box[2]) };
  }
  if (filename.endsWith('.jpg') && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset++] !== 0xff) throw new Error(`Invalid JPEG marker: ${filename}`);
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker === 0xd9 || marker === 0xda) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      const length = bytes.readUInt16BE(offset);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
      }
      if (length < 2) throw new Error(`Invalid JPEG segment: ${filename}`);
      offset += length;
    }
  }
  throw new Error(`Unsupported image dimensions: ${filename}`);
}
