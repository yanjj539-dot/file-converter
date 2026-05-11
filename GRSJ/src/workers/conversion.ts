import type { WorkerRequest } from './engines/types';

function postProgress(id: string, progress: number) {
  self.postMessage({ type: 'progress', id, progress });
}

function postDone(id: string, resultBuffer: ArrayBuffer) {
  self.postMessage({ type: 'done', id, resultBuffer }, [resultBuffer]);
}

function postError(id: string, error: string) {
  self.postMessage({ type: 'error', id, error });
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, sourceType, sourceFormat, targetFormat, fileBuffer } = e.data;

  try {
    let engine: { convert: (buf: ArrayBuffer, src: string, tgt: string, onProgress: (p: number) => void) => Promise<ArrayBuffer> };

    switch (sourceType) {
      case 'image': {
        const mod = await import('./engines/image');
        engine = mod.imageEngine;
        break;
      }
      case 'document': {
        const mod = await import('./engines/document');
        engine = mod.documentEngine;
        break;
      }
      case 'audio':
      case 'video': {
        const mod = await import('./engines/audio-video');
        engine = mod.audioVideoEngine;
        break;
      }
      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }

    const resultBuffer = await engine.convert(
      fileBuffer, sourceFormat, targetFormat,
      (progress) => postProgress(id, progress)
    );

    postDone(id, resultBuffer);
  } catch (err) {
    postError(id, err instanceof Error ? err.message : '转换失败');
  }
};
