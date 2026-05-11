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
        <h2 className="text-caption-upper text-muted tracking-wide">
          转换队列 ({tasks.length})
        </h2>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <button onClick={onStartAll}
              className="text-button text-white px-4 rounded-md bg-coral hover:bg-coral-active transition-colors"
              style={{ height: '40px' }}>
              全部开始 ({pendingCount})
            </button>
          )}
          {doneCount > 0 && (
            <button onClick={onClear}
              className="text-button text-muted px-4 rounded-md bg-canvas border border-hairline
                         hover:text-error transition-colors"
              style={{ height: '40px' }}>
              清除已完成
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <QueueItem key={task.id} task={task}
            onFormatChange={onFormatChange} onSetOptions={onSetOptions} onRemove={onRemove} />
        ))}
      </div>
    </div>
  );
}
