'use client';

import type { HistoryEntry } from '@/lib/types';
import { downloadBlob } from '@/lib/download';

interface HistoryPanelProps {
  isOpen: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HistoryPanel({ isOpen, entries, onClose, onRemove, onClear }: HistoryPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed top-0 right-0 h-full w-80 bg-[var(--color-card)] border-l border-[var(--color-border)]
        z-50 transform transition-transform duration-200 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)]">
          <h2 className="font-semibold text-[var(--color-text-primary)]">转换历史</h2>
          <div className="flex gap-2">
            {entries.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors"
              >
                清空
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-56px)]">
          {entries.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-12">
              暂无转换记录
            </p>
          ) : (
            entries.map(entry => (
              <div
                key={entry.id}
                className="px-4 py-3 border-b border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
              >
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {entry.fileName}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {entry.sourceFormat.toUpperCase()} → {entry.targetFormat.toUpperCase()}
                  <span className="mx-1">·</span>
                  {formatSize(entry.fileSize)}
                  <span className="mx-1">·</span>
                  {formatDate(entry.createdAt)}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={async () => {
                      const response = await fetch(entry.blobUrl);
                      const blob = await response.blob();
                      downloadBlob(blob, `${entry.fileName.replace(/\.[^.]+$/, '')}.${entry.targetFormat}`);
                    }}
                    className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                  >
                    重新下载
                  </button>
                  <button
                    onClick={() => onRemove(entry.id)}
                    className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
