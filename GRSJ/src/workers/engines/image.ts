import type { ConversionEngine } from './types';

export const imageEngine: ConversionEngine = {
  async convert(fileBuffer, sourceFormat, targetFormat, onProgress) {
    onProgress(10);
    const blob = new Blob([fileBuffer]);
    const sourceUrl = URL.createObjectURL(blob);

    try {
      // HEIC needs special decoding
      if (sourceFormat === 'heic') {
        const { default: heic2any } = await import('heic2any');
        onProgress(30);
        const result = await heic2any({ blob, toType: `image/${targetFormat}` });
        onProgress(80);
        const outBlob = Array.isArray(result) ? result[0] : result;
        return await (outBlob as Blob).arrayBuffer();
      }

      // SVG → raster
      if (sourceFormat === 'svg') {
        onProgress(30);
        const img = await blobToImageBitmap(blob);
        const canvas = new OffscreenCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        onProgress(70);
        const outBlob = await canvas.convertToBlob({ type: `image/${targetFormat}` });
        return await outBlob.arrayBuffer();
      }

      // Generic image conversion via Canvas
      onProgress(30);
      const img = await blobToImageBitmap(blob);
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      onProgress(70);

      const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
      const outBlob = await canvas.convertToBlob({ type: mimeType, quality: 0.92 });
      return await outBlob.arrayBuffer();
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  },
};

async function blobToImageBitmap(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob);
}
