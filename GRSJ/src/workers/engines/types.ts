export interface ConversionEngine {
  convert(
    fileBuffer: ArrayBuffer,
    sourceFormat: string,
    targetFormat: string,
    onProgress: (progress: number) => void
  ): Promise<ArrayBuffer>;
}

export type WorkerRequest = {
  id: string;
  sourceType: 'image' | 'document' | 'audio' | 'video';
  sourceFormat: string;
  targetFormat: string;
  fileBuffer: ArrayBuffer;
};
