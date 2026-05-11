'use client';

import type { ConversionTask } from '@/lib/types';
import FormatSelect from './FormatSelect';
import ProgressBar from './ProgressBar';
import StatusIcon from './StatusIcon';

interface QueueItemProps {
  task: ConversionTask;
  onFormatChange: (id: string, format: string) => void;
  onRemove: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function QueueItem({ task, onFormatChange, onRemove }: QueueItemProps) {
  return (
    <div className="group flex items-center gap-3 px-4 py-3 bg-[var(--color-card)]
                    border border-[var(--color-border)] rounded-[var(--radius-card)]
                    hover:shadow-sm transition-shadow">
      {/* Status icon */}
      <StatusIcon status={task.status} />

      {/* File info */}
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

        {/* Progress */}
        {task.status === 'converting' && (
          <div className="mt-2">
            <ProgressBar progress={task.progress} />
          </div>
        )}

        {/* Error */}
        {task.status === 'error' && task.error && (
          <p className="text-xs text-[var(--color-error)] mt-1">{task.error}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
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
  );
}
