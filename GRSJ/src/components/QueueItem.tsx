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
  onRemove: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function QueueItem({ task, onFormatChange, onSetOptions, onRemove }: QueueItemProps) {
  const [showSettings, setShowSettings] = useState(false);
  const isPending = task.status === 'pending';

  return (
    <div className="group bg-[var(--color-card)] border border-[var(--color-border)]
                    rounded-[var(--radius-card)] hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 px-4 py-3">
        <StatusIcon status={task.status} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {task.fileName}
            </span>
            <span className="text-xs text-[var(--color-text-muted)] shrink-0">
              {formatSize(task.fileSize)}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[var(--color-text-secondary)] uppercase">
              {task.sourceFormat}
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" className="text-[var(--color-text-muted)]">
              <path d="M3 6h6M8 3l3 3-3 3"/>
            </svg>
            <FormatSelect task={task} onChange={(fmt) => onFormatChange(task.id, fmt)} />
          </div>

          {task.status === 'converting' && (
            <div className="mt-2">
              <ProgressBar progress={task.progress} />
            </div>
          )}

          {task.status === 'error' && task.error && (
            <p className="text-xs text-[var(--color-error)] mt-1">{task.error}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Settings toggle */}
          {isPending && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-btn)]
                         transition-colors ${showSettings
                           ? 'bg-[var(--color-accent-secondary)] text-white'
                           : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]'
                         }`}
              title="质量设置"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="5" cy="5" r="2"/><path d="M6.5 5h7"/><circle cx="5" cy="5" r="4.5"/>
                <line x1="7" y1="4" x2="9" y2="2"/><line x1="7" y1="6" x2="9" y2="8"/>
              </svg>
            </button>
          )}

          {task.status === 'done' && task.resultBlobUrl && (
            <a
              href={task.resultBlobUrl}
              download={`${task.fileName.replace(/\.[^.]+$/, '')}.${task.targetFormat}`}
              className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-btn)]
                         text-[var(--color-success)] hover:bg-[var(--color-bg)] transition-colors"
              title="下载"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2v10M4 8l4 4 4-4M2 14h12"/>
              </svg>
            </a>
          )}
          <button
            onClick={() => onRemove(task.id)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-[var(--radius-btn)]
                       text-[var(--color-text-muted)] hover:text-[var(--color-error)]
                       hover:bg-[var(--color-bg)] opacity-0 group-hover:opacity-100 transition-all"
            title="移除"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l8 8M11 3l-8 8"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Quality Settings Panel */}
      {isPending && showSettings && (
        <QualitySettings task={task} onChange={(opts) => onSetOptions(task.id, opts)} />
      )}
    </div>
  );
}

// ====== Quality Settings Panel ======
function QualitySettings({ task, onChange }: {
  task: ConversionTask;
  onChange: (opts: Partial<ConversionOptions>) => void;
}) {
  const opts = task.options;
  const isImage = task.sourceType === 'image';
  const isDoc = task.sourceType === 'document';
  const isAudio = task.sourceType === 'audio';
  const isVideo = task.sourceType === 'video';

  return (
    <div className="px-4 pb-3 border-t border-[var(--color-border)] pt-3 space-y-3">
      {/* Quality slider (images + video) */}
      {(isImage || isVideo) && (
        <div>
          <label className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
            <span>{isImage ? '图片质量' : '视频质量'}</span>
            <span className="font-medium text-[var(--color-text-primary)]">{opts.quality}%</span>
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={opts.quality}
            onChange={(e) => onChange({ quality: Number(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none bg-[var(--color-border)]
                       cursor-pointer accent-[var(--color-accent)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
            <span>小文件</span><span>高质量</span>
          </div>
        </div>
      )}

      {/* Image resolution */}
      {isImage && (
        <div>
          <label className="text-xs text-[var(--color-text-secondary)] block mb-1">分辨率</label>
          <select
            value={opts.videoResolution}
            onChange={(e) => onChange({ videoResolution: e.target.value })}
            className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)]
                       rounded-[var(--radius-btn)] px-2 py-1.5 w-full outline-none
                       focus:border-[var(--color-accent)]"
          >
            <option value="original">原始尺寸</option>
            <option value="3840x2160">4K (3840×2160)</option>
            <option value="2560x1440">2K (2560×1440)</option>
            <option value="1920x1080">1080p (1920×1080)</option>
            <option value="1280x720">720p (1280×720)</option>
            <option value="800x600">800×600</option>
          </select>
        </div>
      )}

      {/* Video resolution */}
      {isVideo && (
        <div>
          <label className="text-xs text-[var(--color-text-secondary)] block mb-1">输出分辨率</label>
          <select
            value={opts.videoResolution}
            onChange={(e) => onChange({ videoResolution: e.target.value })}
            className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)]
                       rounded-[var(--radius-btn)] px-2 py-1.5 w-full outline-none
                       focus:border-[var(--color-accent)]"
          >
            <option value="original">原始分辨率</option>
            <option value="3840x2160">4K (3840×2160)</option>
            <option value="2560x1440">2K (2560×1440)</option>
            <option value="1920x1080">1080p (1920×1080)</option>
            <option value="1280x720">720p (1280×720)</option>
            <option value="720x480">480p (720×480)</option>
          </select>
        </div>
      )}

      {/* Audio bitrate */}
      {(isAudio || isVideo) && (
        <div>
          <label className="text-xs text-[var(--color-text-secondary)] block mb-1">
            {isAudio ? '音频比特率' : '音频比特率'}
          </label>
          <select
            value={opts.audioBitrate}
            onChange={(e) => onChange({ audioBitrate: e.target.value })}
            className="text-xs bg-[var(--color-bg)] border border-[var(--color-border)]
                       rounded-[var(--radius-btn)] px-2 py-1.5 w-full outline-none
                       focus:border-[var(--color-accent)]"
          >
            <option value="320k">320 kbps (最高)</option>
            <option value="256k">256 kbps (高)</option>
            <option value="192k">192 kbps (标准)</option>
            <option value="128k">128 kbps (经济)</option>
            <option value="96k">96 kbps (最小)</option>
            <option value="64k">64 kbps (极低)</option>
          </select>
        </div>
      )}

      {/* Document: PDF quality hint */}
      {isDoc && task.targetFormat === 'pdf' && (
        <div>
          <label className="flex justify-between text-xs text-[var(--color-text-secondary)] mb-1">
            <span>字体大小</span>
            <span className="font-medium text-[var(--color-text-primary)]">{opts.quality}%</span>
          </label>
          <input
            type="range"
            min="60"
            max="150"
            value={opts.quality}
            onChange={(e) => onChange({ quality: Number(e.target.value) })}
            className="w-full h-1.5 rounded-full appearance-none bg-[var(--color-border)]
                       cursor-pointer accent-[var(--color-accent)]"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
            <span>密集</span><span>舒朗</span>
          </div>
        </div>
      )}
    </div>
  );
}
