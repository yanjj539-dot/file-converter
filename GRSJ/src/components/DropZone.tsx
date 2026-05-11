'use client';

import { useState, useCallback, useRef } from 'react';
import { getAcceptedExtensions } from '@/lib/formats';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export default function DropZone({ onFilesAdded }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(dragging);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onFilesAdded(files);
  }, [onFilesAdded]);

  const handleSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onFilesAdded(files);
    if (inputRef.current) inputRef.current.value = '';
  }, [onFilesAdded]);

  return (
    <div
      onDragEnter={(e) => handleDrag(e, true)}
      onDragOver={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-[var(--radius-container)]
        border-2 border-dashed transition-all duration-200
        flex flex-col items-center justify-center gap-3
        ${isDragging
          ? 'border-[var(--color-accent)] bg-[#EFF6FF] dark:bg-[#1E3A5F] scale-[1.01]'
          : 'border-[var(--color-text-muted)] hover:border-[var(--color-text-secondary)]'
        }
      `}
      style={{ padding: 'clamp(40px, 8vh, 80px) clamp(20px, 4vw, 40px)' }}
    >
      <div className={`
        w-14 h-14 rounded-full flex items-center justify-center
        ${isDragging
          ? 'bg-[var(--color-accent)] text-white'
          : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'
        }
        transition-colors duration-200
      `}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>
      <div className="text-center">
        <p className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {isDragging ? '松开以上传文件' : '拖拽文件到此处'}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          或点击选择 &middot; 支持图片 · 文档 · 音视频
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={getAcceptedExtensions()}
        onChange={handleSelect}
        className="hidden"
      />
    </div>
  );
}
