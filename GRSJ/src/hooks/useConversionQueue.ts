'use client';

import { useState, useCallback } from 'react';
import type { ConversionTask } from '@/lib/types';
import { detectCategory, getTargetFormats } from '@/lib/formats';

// Image engines — heic2any loaded dynamically (references window)
// Document engines
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
// pdfjs-dist loaded dynamically (references DOMMatrix)

// Audio/video engine — loaded dynamically because @ffmpeg/ffmpeg references window

let taskCounter = 0;

// ====== Image ======
async function convertImage(
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string, onProgress: (p: number) => void
): Promise<ArrayBuffer> {
  onProgress(10);
  const blob = new Blob([fileBuffer]);
  if (sourceFormat === 'heic') {
    const { default: heic2any } = await import('heic2any');
    onProgress(30);
    const result = await heic2any({ blob, toType: `image/${targetFormat}` });
    onProgress(80);
    const outBlob = Array.isArray(result) ? result[0] : result;
    return await (outBlob as Blob).arrayBuffer();
  }
  onProgress(30);
  const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
  const img = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  onProgress(70);
  const outBlob = await canvas.convertToBlob({ type: mimeType, quality: 0.92 });
  return await outBlob.arrayBuffer();
}

// ====== Document ======
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '');
}
function htmlToMarkdown(html: string): string {
  let md = html;
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = stripHtml(md);
  return md.trim();
}
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function wrapText(text: string, fontSize: number, maxWidth: number): string[] {
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).length <= charsPerLine) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}
async function textToPdf(content: string, inputType: 'html' | 'text'): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  const margin = 50;
  const text = inputType === 'html' ? stripHtml(content) : content;
  const lines = wrapText(text, fontSize, 595 - margin * 2);
  let y = 842 - margin;
  for (const line of lines) {
    if (y < margin) break;
    page.drawText(line, { x: margin, y, size: fontSize });
    y -= lineHeight;
  }
  return (await pdfDoc.save()).buffer as ArrayBuffer;
}

async function convertDocument(
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string, onProgress: (p: number) => void
): Promise<ArrayBuffer> {
  onProgress(10);
  if (sourceFormat === 'docx') {
    const result = await mammoth.convertToHtml({ arrayBuffer: fileBuffer });
    onProgress(50);
    const html = result.value;
    if (targetFormat === 'html') return new TextEncoder().encode(html).buffer;
    if (targetFormat === 'txt') return new TextEncoder().encode(stripHtml(html)).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode(htmlToMarkdown(html)).buffer;
    if (targetFormat === 'pdf') return await textToPdf(html, 'html');
  }
  if (sourceFormat === 'md') {
    const mdText = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    const html = String(await unified().use(remarkParse).use(remarkHtml).process(mdText));
    onProgress(60);
    if (targetFormat === 'html') return new TextEncoder().encode(html).buffer;
    if (targetFormat === 'txt') return new TextEncoder().encode(stripHtml(html)).buffer;
    if (targetFormat === 'pdf') return await textToPdf(html, 'html');
    if (targetFormat === 'docx') throw new Error('MD → DOCX 暂不支持');
  }
  if (sourceFormat === 'html') {
    const htmlText = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    if (targetFormat === 'txt') return new TextEncoder().encode(stripHtml(htmlText)).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode(htmlToMarkdown(htmlText)).buffer;
    if (targetFormat === 'pdf') return await textToPdf(htmlText, 'html');
  }
  if (sourceFormat === 'txt') {
    const text = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    if (targetFormat === 'html') {
      return new TextEncoder().encode(`<html><body><pre>${escapeHtml(text)}</pre></body></html>`).buffer;
    }
    if (targetFormat === 'md') return fileBuffer;
    if (targetFormat === 'pdf') return await textToPdf(text, 'text');
  }
  if (sourceFormat === 'pdf') {
    const { getDocument } = await import('pdfjs-dist');
    onProgress(20);
    const pdf = await getDocument({ data: fileBuffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(' ');
      pages.push(text);
      onProgress(20 + Math.floor((i / pdf.numPages) * 60));
    }
    const fullText = pages.join('\n\n');
    if (targetFormat === 'txt') return new TextEncoder().encode(fullText).buffer;
    if (targetFormat === 'html') {
      return new TextEncoder().encode(`<html><body>${pages.map(p => `<p>${escapeHtml(p)}</p>`).join('\n')}</body></html>`).buffer;
    }
    if (targetFormat === 'md') return new TextEncoder().encode(fullText).buffer;
  }
  throw new Error(`不支持的转换: ${sourceFormat} → ${targetFormat}`);
}

// ====== Audio/Video ======
// FFmpeg loaded from public/ to bypass Turbopack static export dynamic import limitations
let ffmpegInstance: any = null;
let ffmpegPromise: Promise<any> | null = null;

async function getFFmpeg(): Promise<any> {
  if (ffmpegInstance?.loaded) return ffmpegInstance;
  if (ffmpegPromise) return ffmpegPromise;
  ffmpegPromise = (async () => {
    // Use indirect eval to bypass Turbopack static analysis
    const dynamicImport = new Function('url', 'return import(url)') as (url: string) => Promise<any>;
    const { FFmpeg } = await dynamicImport('/ffmpeg/ffmpeg/index.js');
    ffmpegInstance = new FFmpeg();
    await ffmpegInstance.load({
      coreURL: '/ffmpeg/ffmpeg-core.js',
      wasmURL: '/ffmpeg/ffmpeg-core.wasm',
    });
    return ffmpegInstance;
  })();
  return ffmpegPromise;
}

async function convertAudioVideo(
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string, onProgress: (p: number) => void
): Promise<ArrayBuffer> {
  const ff = await getFFmpeg();
  const inputExt = sourceFormat === 'jpg' ? 'jpeg' : sourceFormat;
  const outputExt = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
  const inputName = `input.${inputExt}`;
  const outputName = `output.${outputExt}`;
  await ff.writeFile(inputName, new Uint8Array(fileBuffer));
  onProgress(15);
  await ff.exec(['-i', inputName, outputName]);
  onProgress(90);
  const data = await ff.readFile(outputName);
  onProgress(100);
  return (data as Uint8Array).buffer.slice(0) as ArrayBuffer;
}

// ====== Hook ======
type EngineFn = (
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string, onProgress: (p: number) => void
) => Promise<ArrayBuffer>;

export function useConversionQueue() {
  const [tasks, setTasks] = useState<ConversionTask[]>([]);
  const [fileMap] = useState<Map<string, File>>(() => new Map());

  const updateTask = useCallback((taskId: string, update: Partial<ConversionTask>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...update } : t));
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
      fileMap.set(taskId, file);
      newTasks.push({
        id: taskId, fileName: file.name, fileSize: file.size,
        sourceType: category, sourceFormat: ext, targetFormat,
        status: 'pending', progress: 0, resultBlobUrl: null,
        error: null, createdAt: Date.now(),
      });
    }
    setTasks(prev => [...prev, ...newTasks]);
  }, [fileMap]);

  const updateTargetFormat = useCallback((taskId: string, format: string) => {
    updateTask(taskId, { targetFormat: format });
  }, [updateTask]);

  const removeTask = useCallback((taskId: string) => {
    fileMap.delete(taskId);
    setTasks(prev => {
      const task = prev.find(t => t.id === taskId);
      if (task?.resultBlobUrl) URL.revokeObjectURL(task.resultBlobUrl);
      return prev.filter(t => t.id !== taskId);
    });
  }, [fileMap]);

  const clearTasks = useCallback(() => {
    fileMap.clear();
    setTasks(prev => {
      for (const t of prev) {
        if (t.resultBlobUrl) URL.revokeObjectURL(t.resultBlobUrl);
      }
      return [];
    });
  }, [fileMap]);

  const startConversion = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === 'converting') return;
    const file = fileMap.get(taskId);
    if (!file) return;

    updateTask(taskId, { status: 'converting', progress: 0 });

    try {
      const fileBuffer = await file.arrayBuffer();
      let engine: EngineFn;
      switch (task.sourceType) {
        case 'image': engine = convertImage; break;
        case 'document': engine = convertDocument; break;
        case 'audio': case 'video': engine = convertAudioVideo; break;
        default: throw new Error(`Unsupported type: ${task.sourceType}`);
      }

      const resultBuffer = await engine(
        fileBuffer, task.sourceFormat, task.targetFormat,
        (progress) => updateTask(taskId, { progress })
      );

      const blob = new Blob([resultBuffer]);
      const url = URL.createObjectURL(blob);
      updateTask(taskId, { status: 'done', progress: 100, resultBlobUrl: url });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      updateTask(taskId, { status: 'error', error: msg || '转换失败' });
    }
  }, [tasks, fileMap, updateTask]);

  const startAll = useCallback(async () => {
    const pending = tasks.filter(t => t.status === 'pending');
    for (const task of pending) {
      await startConversion(task.id);
    }
  }, [tasks, startConversion]);

  return { tasks, addFiles, updateTargetFormat, removeTask, clearTasks, startConversion, startAll };
}
