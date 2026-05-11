export type FileCategory = 'image' | 'document' | 'audio' | 'video';

export type TaskStatus = 'pending' | 'converting' | 'done' | 'error';

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
