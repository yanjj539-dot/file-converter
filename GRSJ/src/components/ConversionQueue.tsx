'use client';

import type { ConversionTask, ConversionOptions } from '@/lib/types';
import QueueItem from './QueueItem';

interface ConversionQueueProps {
  tasks: ConversionTask[];
  onFormatChange: (id: string, format: string) => void;
  onSetOptions: (id: string, options: Partial<ConversionOptions>) => void;
  onRemove: (id: string) => void;
  onStartAll: () => void;
  onClear: () => void;
}

export default function ConversionQueue({
  tasks, onFormatChange, onSetOptions, onRemove, onStartAll, onClear,
}: ConversionQueueProps) {
  if (tasks.length === 0) return null;

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          转换队列 ({tasks.length})
        </h2>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <button
              onClick={onStartAll}
              className="text-xs font-medium px-3 py-1.5 rounded-[var(--radius-btn)]
                         bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
            >
              全部开始 ({pendingCount})
            </button>
          )}
          {doneCount > 0 && (
            <button
              onClick={onClear}
              className="text-xs font-medium px-3 py-1.5 rounded-[var(--radius-btn)]
                         bg-[var(--color-bg)] text-[var(--color-text-secondary)]
                         border border-[var(--color-border)] hover:text-[var(--color-error)] transition-colors"
            >
              清除已完成
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <QueueItem
            key={task.id}
            task={task}
            onFormatChange={onFormatChange}
            onSetOptions={onSetOptions}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
