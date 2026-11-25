// F:/filebrik/src/lib/dpiInject.ts
// Injects JFIF APP0 marker into JPEG binary data to ensure strict 200 or 300 DPI metadata.
// Required by Indian exam recruitment portals (UPSC, SSC, NTA).

export function injectJfifDpi(jpegBuffer: ArrayBuffer, dpi: number = 200): ArrayBuffer {
  const view = new DataView(jpegBuffer);

  // Validate SOI (Start of Image) marker 0xFFD8
  if (view.getUint16(0) !== 0xffd8) {
    throw new Error('Not a valid JPEG buffer');
  }

  // Check if JFIF APP0 (0xFFE0) marker exists at offset 2
  let app0Offset = 2;
  if (view.getUint16(app0Offset) === 0xffe0) {
    // Existing APP0 marker: length is at offset 4
    // JFIF density units byte is at offset 11 (1 = dots per inch)
    // X density is uint16 at offset 12, Y density is uint16 at offset 14
    view.setUint8(app0Offset + 9, 1); // 1 = dots per inch (DPI)
    view.setUint16(app0Offset + 10, dpi); // Xdensity
    view.setUint16(app0Offset + 12, dpi); // Ydensity
    return jpegBuffer;
  }

  // Construct standard 18-byte JFIF APP0 header
  // 0xFFE0 (marker), 0x0010 (length = 16), 'JFIF\0' (5 bytes), 0x0102 (version 1.02),
  // 0x01 (units: dots per inch), Xdensity (2 bytes), Ydensity (2 bytes), 0x00 0x00 (thumbnails)
  const jfifHeader = new Uint8Array([
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x02, 0x01,
    (dpi >> 8) & 0xff, dpi & 0xff, (dpi >> 8) & 0xff, dpi & 0xff, 0x00, 0x00
  ]);

  // Merge SOI (2 bytes) + JFIF header (18 bytes) + rest of image (from offset 2)
  const combined = new Uint8Array(2 + jfifHeader.length + (jpegBuffer.byteLength - 2));
  combined.set(new Uint8Array(jpegBuffer, 0, 2), 0);
  combined.set(jfifHeader, 2);
  combined.set(new Uint8Array(jpegBuffer, 2), 2 + jfifHeader.length);

  return combined.buffer;
}
