export type FileCategory = 'image' | 'document' | 'audio' | 'video';

export type TaskStatus = 'pending' | 'converting' | 'done' | 'error';

export interface ConversionOptions {
  quality: number;           // 1-100, 图片质量 / 视频CRF映射
  audioBitrate: string;      // 音频比特率 "128k" "192k" "256k" "320k"
  videoResolution: string;   // "original" "1920x1080" "1280x720" "720x480"
}

export interface ConversionTask {
  id: string;
  fileName: string;
  fileSize: number;
  sourceType: FileCategory;
  sourceFormat: string;
  targetFormat: string;
  status: TaskStatus;
  progress: number;
  resultBlobUrl: string | null;
  error: string | null;
  createdAt: number;
  options: ConversionOptions;
}

export interface HistoryEntry {
  id: string;
  fileName: string;
  sourceFormat: string;
  targetFormat: string;
  fileSize: number;
  blobUrl: string;
  createdAt: number;
}

export type WorkerRequest = {
  id: string;
  sourceType: FileCategory;
  sourceFormat: string;
  targetFormat: string;
  fileBuffer: ArrayBuffer;
};

export type WorkerResponse =
  | { type: 'progress'; id: string; progress: number }
  | { type: 'done'; id: string; resultBuffer: ArrayBuffer }
  | { type: 'error'; id: string; error: string };
