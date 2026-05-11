'use client';

import { useState } from 'react';
import type { ConversionTask, ConversionOptions } from '@/lib/types';
import FormatSelect from './FormatSelect';
import ProgressBar from './ProgressBar';
import StatusIcon from './StatusIcon';

interface QueueItemProps {
  task: ConversionTask;
  onFormatChange: (id: string, format: string) => void;
  onSetOptions: (id: string, options: Partial<ConversionOptions>) => void;
  fileRef?: File;
  onRemove: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function QueueItem({ task, onFormatChange, onSetOptions, fileRef, onRemove }: QueueItemProps) {
  const [showSettings, setShowSettings] = useState(false);
  const isPending = task.status === 'pending';

  return (
    <div className="group bg-surface-card border border-hairline rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 px-4 py-3">
        <StatusIcon status={task.status} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-body-sm font-medium text-ink truncate">{task.fileName}</span>
            <span className="text-caption text-muted-soft shrink-0">{formatSize(task.fileSize)}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-caption-upper text-muted">{task.sourceFormat}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" className="text-muted-soft">
              <path d="M3 6h6M8 3l3 3-3 3"/>
            </svg>
            <FormatSelect task={task} onChange={(fmt) => onFormatChange(task.id, fmt)} />
          </div>
          {task.status === 'converting' && <div className="mt-2"><ProgressBar progress={task.progress} /></div>}
          {task.status === 'done' && task.resultSize && (
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-caption text-muted">{formatSize(task.fileSize)}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" className="text-muted-soft"><path d="M3 6h6M8 3l3 3-3 3"/></svg>
              <span className="text-caption font-medium text-ink">{formatSize(task.resultSize)}</span>
              {task.resultSize < task.fileSize && (
                <span className="text-caption text-success ml-1">
                  -{Math.round((1 - task.resultSize / task.fileSize) * 100)}%
                </span>
              )}
            </div>
          )}
          {task.status === 'error' && task.error && <p className="text-caption text-error mt-1">{task.error}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isPending && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${showSettings ? 'bg-coral text-white' : 'text-muted-soft hover:bg-surface-soft'}`}
              title="质量设置"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="5" cy="5" r="2"/><path d="M6.5 5h7"/><circle cx="5" cy="5" r="4.5"/>
                <line x1="7" y1="4" x2="9" y2="2"/><line x1="7" y1="6" x2="9" y2="8"/>
              </svg>
            </button>
          )}
          {task.status === 'done' && task.resultBlobUrl && (
            <a href={task.resultBlobUrl}
               download={`${task.fileName.replace(/\.[^.]+$/, '')}.${task.targetFormat}`}
               className="inline-flex items-center justify-center w-8 h-8 rounded-md text-success hover:bg-surface-soft transition-colors" title="下载">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v10M4 8l4 4 4-4M2 14h12"/>
              </svg>
            </a>
          )}
          <button
            onClick={() => onRemove(task.id)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-muted-soft
                       hover:text-error hover:bg-surface-soft opacity-0 group-hover:opacity-100 transition-all" title="移除">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l8 8M11 3l-8 8"/>
            </svg>
          </button>
        </div>
      </div>
      {isPending && showSettings && (
        <QualitySettings task={task} fileRef={fileRef} onChange={(opts) => onSetOptions(task.id, opts)} />
      )}
    </div>
  );
}

function QualitySettings({ task, fileRef, onChange }: {
  task: ConversionTask; fileRef?: File; onChange: (opts: Partial<ConversionOptions>) => void;
}) {
  const opts = task.options;
  const isImage = task.sourceType === 'image';
  const isVideo = task.sourceType === 'video';
  const isAudio = task.sourceType === 'audio';
  const isDoc = task.sourceType === 'document';
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

  const selectClass = "text-caption bg-canvas border border-hairline rounded-md px-2 py-1.5 w-full outline-none focus:border-coral";
  const labelClass = "text-caption text-muted block mb-1";

  // Estimate image output size using Canvas encode
  const estimateImageSize = async (quality: number) => {
    if (!fileRef) return;
    try {
      const blob = new Blob([await fileRef.arrayBuffer()]);
      const img = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const mimeType = task.targetFormat === 'jpg' ? 'image/jpeg' : `image/${task.targetFormat}`;
      const outBlob = await canvas.convertToBlob({ type: mimeType, quality: Math.min(quality / 100, 0.99) });
      setEstimatedSize(outBlob.size);
    } catch { setEstimatedSize(null); }
  };

  return (
    <div className="px-4 pb-3 border-t border-hairline pt-3 space-y-3">
      {/* Quality slider */}
      {(isImage || isVideo) && (
        <div>
          <label className="flex justify-between text-caption text-muted mb-1">
            <span>{isImage ? '图片质量' : '视频质量'}</span>
            <span className="font-medium text-ink">{opts.quality}%</span>
          </label>
          <input type="range" min="10" max="100" value={opts.quality}
            onChange={(e) => {
              const q = Number(e.target.value);
              onChange({ quality: q });
              if (isImage) {
                const t = setTimeout(() => estimateImageSize(q), 120);
                return () => clearTimeout(t);
              }
            }}
            className="w-full h-1.5 rounded-full appearance-none bg-hairline cursor-pointer accent-coral" />
          {estimatedSize !== null && (
            <div className="mt-1 text-[11px] text-muted">
              预估输出: <span className="font-medium text-ink">{formatSize(estimatedSize)}</span>
              {task.fileSize > 0 && (
                <span className="ml-1 text-success">
                  -{Math.round((1 - estimatedSize / task.fileSize) * 100)}%
                </span>
              )}
            </div>
          )}
          <div className="flex justify-between text-[10px] text-muted-soft">
            <span>小文件</span><span>高质量</span>
          </div>
        </div>
      )}

      {isImage && (
        <div>
          <label className={labelClass}>分辨率</label>
          <select value={opts.videoResolution} onChange={(e) => onChange({ videoResolution: e.target.value })} className={selectClass}>
            <option value="original">原始尺寸</option>
            <option value="1920x1080">1080p (1920×1080)</option>
            <option value="1280x720">720p (1280×720)</option>
            <option value="800x600">800×600</option>
          </select>
        </div>
      )}

      {isVideo && (
        <>
          <div>
            <label className={labelClass}>输出分辨率</label>
            <select value={opts.videoResolution} onChange={(e) => onChange({ videoResolution: e.target.value })} className={selectClass}>
              <option value="original">原始分辨率</option>
              <option value="1920x1080">1080p</option>
              <option value="1280x720">720p</option>
              <option value="720x480">480p</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>音频比特率</label>
            <select value={opts.audioBitrate} onChange={(e) => {
              onChange({ audioBitrate: e.target.value });
              const kbps = parseInt(e.target.value); if (kbps && fileRef) { const ratio = kbps / 192; setEstimatedSize(Math.round(task.fileSize * (opts.quality / 100) * ratio)); }
            }} className={selectClass}>
              <option value="320k">320 kbps (最高)</option>
              <option value="256k">256 kbps (高)</option>
              <option value="192k">192 kbps (标准)</option>
              <option value="128k">128 kbps (经济)</option>
              <option value="96k">96 kbps (最小)</option>
            </select>
            {estimatedSize !== null && (
              <div className="mt-1 text-[11px] text-muted">
                预估输出: <span className="font-medium text-ink">{formatSize(estimatedSize)}</span>
                {task.fileSize > 0 && estimatedSize < task.fileSize && (
                  <span className="ml-1 text-success">-{Math.round((1 - estimatedSize / task.fileSize) * 100)}%</span>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {isAudio && (
        <div>
          <label className={labelClass}>音频比特率</label>
          <select value={opts.audioBitrate} onChange={(e) => {
            onChange({ audioBitrate: e.target.value });
            const kbps = parseInt(e.target.value); if (kbps && fileRef) { const ratio = kbps / 192; setEstimatedSize(Math.round(task.fileSize * (opts.quality / 100) * ratio)); }
          }} className={selectClass}>
            <option value="320k">320 kbps (最高)</option>
            <option value="256k">256 kbps (高)</option>
            <option value="192k">192 kbps (标准)</option>
            <option value="128k">128 kbps (经济)</option>
            <option value="96k">96 kbps (最小)</option>
            <option value="64k">64 kbps (极低)</option>
          </select>
          {estimatedSize !== null && (
            <div className="mt-1 text-[11px] text-muted">
              预估输出: <span className="font-medium text-ink">{formatSize(estimatedSize)}</span>
            </div>
          )}
        </div>
      )}

      {isDoc && task.targetFormat === 'pdf' && (
        <div>
          <label className="flex justify-between text-caption text-muted mb-1">
            <span>字体大小</span>
            <span className="font-medium text-ink">{opts.quality}%</span>
          </label>
          <input type="range" min="60" max="150" value={opts.quality}
            onChange={(e) => onChange({ quality: Number(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none bg-hairline cursor-pointer accent-coral" />
          <div className="flex justify-between text-[10px] text-muted-soft">
            <span>密集</span><span>舒朗</span>
          </div>
        </div>
      )}
    </div>
  );
}
