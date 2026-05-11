'use client';

import { useCallback } from 'react';
import Header from '@/components/Header';
import DropZone from '@/components/DropZone';
import ConversionQueue from '@/components/ConversionQueue';
import HistoryPanel from '@/components/HistoryPanel';
import { useConversionQueue } from '@/hooks/useConversionQueue';
import { useHistory } from '@/hooks/useHistory';
import { downloadBatch } from '@/lib/download';

export default function Home() {
  const {
    tasks, addFiles, updateTargetFormat, setOptions, removeTask,
    clearTasks, startAll,
  } = useConversionQueue();
  const { entries, isOpen, setIsOpen, addEntry, remove: removeHistory, clear: clearHistory } = useHistory();

  const handleClearCompleted = useCallback(() => {
    const doneTasks = tasks.filter(t => t.status === 'done');
    for (const task of doneTasks) {
      addEntry({
        id: task.id,
        fileName: task.fileName,
        sourceFormat: task.sourceFormat,
        targetFormat: task.targetFormat,
        fileSize: task.fileSize,
        blobUrl: task.resultBlobUrl!,
        createdAt: Date.now(),
      });
      removeTask(task.id);
    }
  }, [tasks, addEntry, removeTask]);

  return (
    <div className="min-h-screen bg-canvas">
      <Header historyCount={entries.length} onHistoryClick={() => setIsOpen(true)} />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <DropZone onFilesAdded={addFiles} />

        <ConversionQueue
          tasks={tasks}
          onFormatChange={updateTargetFormat}
          onSetOptions={setOptions}
          onRemove={removeTask}
          onStartAll={startAll}
          onClear={handleClearCompleted}
        />

        {tasks.length > 0 && tasks.every(t => t.status === 'done') && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => downloadBatch(tasks, `converted-${Date.now()}`)}
              className="text-button text-white px-6 rounded-md bg-coral hover:bg-coral-active transition-colors"
              style={{ height: '40px' }}
            >
              打包下载全部 ({tasks.length} 个文件)
            </button>
          </div>
        )}
      </main>

      <HistoryPanel
        isOpen={isOpen}
        entries={entries}
        onClose={() => setIsOpen(false)}
        onRemove={removeHistory}
        onClear={clearHistory}
      />
    </div>
  );
}
