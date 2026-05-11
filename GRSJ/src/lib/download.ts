import JSZip from 'jszip';
import type { ConversionTask } from './types';

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadBatch(tasks: ConversionTask[], zipName: string): Promise<void> {
  const zip = new JSZip();
  for (const task of tasks) {
    if (task.status === 'done' && task.resultBlobUrl) {
      const response = await fetch(task.resultBlobUrl);
      const blob = await response.blob();
      const baseName = task.fileName.replace(/\.[^.]+$/, '');
      zip.file(`${baseName}.${task.targetFormat}`, blob);
    }
  }
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `${zipName}.zip`);
}
