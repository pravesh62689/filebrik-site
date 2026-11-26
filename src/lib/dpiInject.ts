// F:/filebrik/src/lib/dpiInject.ts
// Injects JFIF APP0 DPI metadata (200 or 300 DPI) into JPEG binary data,
// and optionally pads JPEG COM (0xFFFE) segments when a strict portal minimum KB
// cannot be reached by pixel entropy alone (e.g., small 140x60 signatures).

export function injectJfifDpi(jpegBuffer: ArrayBuffer, dpi: number = 200): ArrayBuffer {
  const view = new DataView(jpegBuffer);

  // Validate SOI (Start of Image) marker 0xFFD8
  if (view.getUint16(0) !== 0xffd8) {
    throw new Error('Not a valid JPEG buffer');
  }

  // Check if JFIF APP0 (0xFFE0) marker exists at offset 2
  const app0Offset = 2;
  if (view.getUint16(app0Offset) === 0xffe0) {
    view.setUint8(app0Offset + 9, 1); // 1 = dots per inch (DPI)
    view.setUint16(app0Offset + 10, dpi); // Xdensity
    view.setUint16(app0Offset + 12, dpi); // Ydensity
    return jpegBuffer;
  }

  // Construct standard 18-byte JFIF APP0 header
  const jfifHeader = new Uint8Array([
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x02, 0x01,
    (dpi >> 8) & 0xff, dpi & 0xff, (dpi >> 8) & 0xff, dpi & 0xff, 0x00, 0x00
  ]);

  const combined = new Uint8Array(2 + jfifHeader.length + (jpegBuffer.byteLength - 2));
  combined.set(new Uint8Array(jpegBuffer, 0, 2), 0);
  combined.set(jfifHeader, 2);
  combined.set(new Uint8Array(jpegBuffer, 2), 2 + jfifHeader.length);

  return combined.buffer;
}

export function padJpegToMinBytes(jpegBuffer: ArrayBuffer, minBytes: number): ArrayBuffer {
  if (jpegBuffer.byteLength >= minBytes) return jpegBuffer;

  const view = new DataView(jpegBuffer);
  if (view.getUint16(0) !== 0xffd8) {
    throw new Error('Not a valid JPEG buffer');
  }

  // Insert valid JPEG COM (0xFFFE) comment segments right after APP0 (or SOI)
  let insertOffset = 2;
  if (view.getUint16(2) >= 0xffe0 && view.getUint16(2) <= 0xffef) {
    const segLen = view.getUint16(4);
    insertOffset = 4 + segLen;
  }

  const needed = minBytes - jpegBuffer.byteLength;
  const chunks: Uint8Array[] = [];
  let remaining = needed;

  while (remaining > 0) {
    // Each COM segment adds 4 overhead bytes (FF FE LL LL) + payload (at least 1 byte)
    const segTotal = Math.min(remaining, 65000);
    const payloadLen = Math.max(1, segTotal - 4);
    const seg = new Uint8Array(4 + payloadLen);
    seg[0] = 0xff;
    seg[1] = 0xfe;
    const declaredLen = payloadLen + 2;
    seg[2] = (declaredLen >> 8) & 0xff;
    seg[3] = declaredLen & 0xff;
    seg.fill(0x20, 4); // spaces
    chunks.push(seg);
    remaining -= seg.length;
  }

  const extraLen = chunks.reduce((a, c) => a + c.length, 0);
  const src = new Uint8Array(jpegBuffer);
  const out = new Uint8Array(src.length + extraLen);
  out.set(src.subarray(0, insertOffset), 0);
  let cursor = insertOffset;
  for (const c of chunks) {
    out.set(c, cursor);
    cursor += c.length;
  }
  out.set(src.subarray(insertOffset), cursor);
  return out.buffer;
}
