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
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 transition-opacity" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-80 bg-canvas border-l border-hairline
        z-50 transform transition-transform duration-200 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-hairline">
          <h2 className="font-display text-title-sm text-ink">转换历史</h2>
          <div className="flex gap-2">
            {entries.length > 0 && (
              <button onClick={onClear} className="text-caption text-muted-soft hover:text-error transition-colors">清空</button>
            )}
            <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4l-8 8"/>
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {entries.length === 0 ? (
            <p className="text-body-sm text-muted-soft text-center py-12">暂无转换记录</p>
          ) : (
            entries.map(entry => (
              <div key={entry.id} className="px-4 py-3 border-b border-hairline hover:bg-surface-soft transition-colors">
                <p className="text-body-sm font-medium text-ink truncate">{entry.fileName}</p>
                <p className="text-caption text-muted mt-0.5">
                  {entry.sourceFormat.toUpperCase()} → {entry.targetFormat.toUpperCase()}
                  <span className="mx-1">·</span>{formatSize(entry.fileSize)}
                  <span className="mx-1">·</span>{formatDate(entry.createdAt)}
                </p>
                <div className="flex gap-3 mt-2">
                  <button onClick={async () => {
                    const r = await fetch(entry.blobUrl); const b = await r.blob();
                    downloadBlob(b, `${entry.fileName.replace(/\.[^.]+$/, '')}.${entry.targetFormat}`);
                  }} className="text-caption text-coral hover:underline">重新下载</button>
                  <button onClick={() => onRemove(entry.id)} className="text-caption text-muted-soft hover:text-error">删除</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
