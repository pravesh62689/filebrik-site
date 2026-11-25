// F:/filebrik/src/lib/binarySearchCompress.ts
// Binary search JPEG quality iteration to compress image strictly within min/max KB limits.

export interface CompressionOptions {
  minKb: number;
  maxKb: number;
  maxDimension?: number;
  initialQuality?: number;
}

export interface CompressionResult {
  blob: Blob;
  sizeKb: number;
  quality: number;
  width: number;
  height: number;
}

export async function binarySearchCompress(
  img: HTMLImageElement,
  options: CompressionOptions
): Promise<CompressionResult> {
  const { minKb, maxKb, maxDimension = 1920 } = options;

  let width = img.naturalWidth;
  let height = img.naturalHeight;

  // Scale down if exceeds maxDimension
  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');
  ctx.drawImage(img, 0, 0, width, height);

  let low = 0.05;
  let high = 0.98;
  let bestBlob: Blob | null = null;
  let bestQuality = 0.8;
  let bestSize = Infinity;

  // Binary search up to 7 iterations
  for (let i = 0; i < 7; i++) {
    const q = (low + high) / 2;
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', q)
    );
    const sizeKb = blob.size / 1024;

    if (sizeKb <= maxKb && sizeKb >= minKb) {
      // Perfect match inside target range
      return { blob, sizeKb, quality: q, width, height };
    }

    if (sizeKb > maxKb) {
      high = q;
    } else {
      low = q;
      bestBlob = blob;
      bestQuality = q;
      bestSize = sizeKb;
    }
  }

  // Fallback to highest quality under maxKb or best achieved
  if (!bestBlob) {
    bestBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), 'image/jpeg', low)
    );
    bestQuality = low;
    bestSize = bestBlob.size / 1024;
  }

  return { blob: bestBlob, sizeKb: bestSize, quality: bestQuality, width, height };
}
