'use client';

import { useCallback } from 'react';
import Header from '@/components/Header';
import DropZone from '@/components/DropZone';
import ConversionQueue from '@/components/ConversionQueue';
import HistoryPanel from '@/components/HistoryPanel';
import { useConversionQueue } from '@/hooks/useConversionQueue';
import { useHistory } from '@/hooks/useHistory';
import { downloadBatch } from '@/lib/download';

/* Anthropic-style spike-mark glyph */
function SpikeMark({ className }: { className?: string }) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
      <line x1="6" y1="1" x2="6" y2="4.5" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="6" y1="7.5" x2="6" y2="11" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="1" y1="6" x2="4.5" y2="6" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="7.5" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

export default function Home() {
  const { tasks, addFiles, updateTargetFormat, setOptions, removeTask, clearTasks, startAll } = useConversionQueue();
  const { entries, isOpen, setIsOpen, addEntry, remove: removeHistory, clear: clearHistory } = useHistory();

  const handleClearCompleted = useCallback(() => {
    const doneTasks = tasks.filter(t => t.status === 'done');
    for (const task of doneTasks) {
      addEntry({
        id: task.id, fileName: task.fileName, sourceFormat: task.sourceFormat,
        targetFormat: task.targetFormat, fileSize: task.fileSize,
        blobUrl: task.resultBlobUrl!, createdAt: Date.now(),
      });
      removeTask(task.id);
    }
  }, [tasks, addEntry, removeTask]);

  return (
    <div className="min-h-screen bg-canvas">
      <Header historyCount={entries.length} onHistoryClick={() => setIsOpen(true)} />

      <main className="max-w-2xl mx-auto px-4 pt-section pb-xxl">
        {/* Hero */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center gap-2 mb-sm">
            <SpikeMark className="text-muted-soft w-3 h-3" />
            <span className="text-caption-upper text-muted tracking-widest">纯本地 · 零上传</span>
          </div>
          <h1 className="font-display text-display-sm text-ink mb-sm">
            文件格式转换
          </h1>
          <p className="text-body-md text-body max-w-md mx-auto">
            所有转换在你的浏览器中完成，文件不会离开你的设备
          </p>

          {/* Stats pills */}
          <div className="flex items-center justify-center gap-3 mt-lg">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-card text-caption text-muted border border-hairline">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
              82 种格式
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-card text-caption text-muted border border-hairline">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1.5" y="2.5" width="9" height="8" rx="1.5"/>
                <circle cx="6" cy="5.5" r="1.5"/><path d="M5 7.5l1 1 2-3"/>
              </svg>
              隐私安全
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill bg-surface-card text-caption text-muted border border-hairline">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 8l3-4 2 2 5-6"/>
              </svg>
              4 大类
            </div>
          </div>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 mb-xl">
          <div className="flex-1 h-px bg-hairline" />
          <SpikeMark className="text-hairline w-4 h-4" />
          <div className="flex-1 h-px bg-hairline" />
        </div>

        <DropZone onFilesAdded={addFiles} />

        <ConversionQueue
          tasks={tasks} onFormatChange={updateTargetFormat} onSetOptions={setOptions}
          onRemove={removeTask} onStartAll={startAll} onClear={handleClearCompleted}
        />

        {tasks.length > 0 && tasks.every(t => t.status === 'done') && (
          <div className="mt-lg flex justify-center">
            <button
              onClick={() => downloadBatch(tasks, `converted-${Date.now()}`)}
              className="text-button text-white px-6 rounded-md bg-coral hover:bg-coral-active transition-colors"
              style={{ height: '40px' }}
            >
              打包下载全部 ({tasks.length} 个文件)
            </button>
          </div>
        )}

        {/* Footer note — only visible when no tasks */}
        {tasks.length === 0 && (
          <p className="text-caption text-muted-soft text-center mt-xxl">
            Powered by browser-native APIs &middot; No server · No tracking
          </p>
        )}
      </main>

      <HistoryPanel
        isOpen={isOpen} entries={entries}
        onClose={() => setIsOpen(false)} onRemove={removeHistory} onClear={clearHistory}
      />
    </div>
  );
}
