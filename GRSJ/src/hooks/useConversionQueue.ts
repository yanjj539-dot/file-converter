'use client';

import { useState, useCallback, useRef } from 'react';
import type { ConversionTask, FileCategory } from '@/lib/types';
import { detectCategory, FORMATS, getTargetFormats } from '@/lib/formats';

let taskCounter = 0;

export function useConversionQueue() {
  const [tasks, setTasks] = useState<ConversionTask[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('@/workers/conversion.ts', import.meta.url)
      );
      workerRef.current.onmessage = (e) => {
        const msg = e.data;
        setTasks(prev => prev.map(t => {
          if (t.id !== msg.id) return t;
          if (msg.type === 'progress') return { ...t, progress: msg.progress, status: 'converting' as const };
          if (msg.type === 'done') {
            const blob = new Blob([msg.resultBuffer]);
            const url = URL.createObjectURL(blob);
            return { ...t, status: 'done' as const, progress: 100, resultBlobUrl: url };
          }
          if (msg.type === 'error') return { ...t, status: 'error' as const, error: msg.error };
          return t;
        }));
      };
    }
    return workerRef.current;
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const newTasks: ConversionTask[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const category = detectCategory(file);
      if (!category) continue;

      const targets = getTargetFormats(ext);
      const targetFormat = targets[0]?.extension || ext;

      const taskId = `task-${++taskCounter}-${Date.now()}`;
      fileMapRef.current.set(taskId, file);

      newTasks.push({
        id: taskId,
        fileName: file.name,
        fileSize: file.size,
        sourceType: category,
        sourceFormat: ext,
        targetFormat,
        status: 'pending',
        progress: 0,
        resultBlobUrl: null,
        error: null,
        createdAt: Date.now(),
      });
    }

    setTasks(prev => [...prev, ...newTasks]);
  }, []);

  const updateTargetFormat = useCallback((taskId: string, format: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, targetFormat: format } : t));
  }, []);

  const removeTask = useCallback((taskId: string) => {
    fileMapRef.current.delete(taskId);
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task?.resultBlobUrl) URL.revokeObjectURL(task.resultBlobUrl);
      return prev.filter(t => t.id !== taskId);
    });
  }, []);

  const clearTasks = useCallback(() => {
    fileMapRef.current.clear();
    setTasks(prev => {
      for (const t of prev) {
        if (t.resultBlobUrl) URL.revokeObjectURL(t.resultBlobUrl);
      }
      return [];
    });
  }, []);

  const startConversion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'converting') return;

    const file = fileMapRef.current.get(taskId);
    if (!file) return;

    const worker = getWorker();

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'converting' as const, progress: 0 } : t));

    // Read file into ArrayBuffer and send to worker
    const fileBuffer = await file.arrayBuffer();
    worker.postMessage({
      id: taskId,
      sourceType: task.sourceType,
      sourceFormat: task.sourceFormat,
      targetFormat: task.targetFormat,
      fileBuffer,
    }, [fileBuffer]);
  }, [tasks, getWorker]);

  const startAll = useCallback(async () => {
    const pending = tasks.filter(t => t.status === 'pending');
    for (const task of pending) {
      await startConversion(task.id);
    }
  }, [tasks, startConversion]);

  return {
    tasks,
    addFiles,
    updateTargetFormat,
    removeTask,
    clearTasks,
    startConversion,
    startAll,
  };
}
