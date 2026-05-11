'use client';

import { useState, useCallback } from 'react';
import type { ConversionTask, ConversionOptions } from '@/lib/types';
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
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string,
  onProgress: (p: number) => void, options: ConversionOptions
): Promise<ArrayBuffer> {
  onProgress(10);
  const blob = new Blob([fileBuffer]);
  const quality = (options.quality ?? 92) / 100;

  if (sourceFormat === 'heic') {
    const { default: heic2any } = await import('heic2any');
    onProgress(30);
    const result = await heic2any({ blob, toType: `image/${targetFormat}`, quality });
    onProgress(80);
    const outBlob = Array.isArray(result) ? result[0] : result;
    return await (outBlob as Blob).arrayBuffer();
  }
  onProgress(30);
  const mimeType = targetFormat === 'jpg' ? 'image/jpeg' : `image/${targetFormat}`;
  const img = await createImageBitmap(blob);
  let w = img.width, h = img.height;

  // Resize if max dimensions are set
  if (options.videoResolution && options.videoResolution !== 'original') {
    const [maxW, maxH] = options.videoResolution.split('x').map(Number);
    if (maxW && maxH && (w > maxW || h > maxH)) {
      const ratio = Math.min(maxW / w, maxH / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
  }

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  onProgress(70);
  const outBlob = await canvas.convertToBlob({ type: mimeType, quality });
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
async function textToPdf(content: string, inputType: 'html' | 'text', fontSize: number = 12): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
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

// ====== CSV helpers ======
function csvToHtmlTable(csv: string): string {
  const rows = csv.trim().split('\n').map(r => parseCSVLine(r));
  if (!rows.length) return '<table></table>';
  const headers = rows[0];
  let html = '<table border="1" style="border-collapse:collapse">\n<thead><tr>';
  for (const h of headers) html += `<th>${escapeHtml(h)}</th>`;
  html += '</tr></thead>\n<tbody>';
  for (let i = 1; i < rows.length; i++) {
    html += '<tr>';
    for (const cell of rows[i]) html += `<td>${escapeHtml(cell)}</td>`;
    html += '</tr>\n';
  }
  html += '</tbody></table>';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
}
function csvToMarkdownTable(csv: string): string {
  const rows = csv.trim().split('\n').map(r => parseCSVLine(r));
  if (!rows.length) return '';
  const headers = rows[0];
  let md = '| ' + headers.join(' | ') + ' |\n';
  md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  for (let i = 1; i < rows.length; i++) {
    md += '| ' + rows[i].join(' | ') + ' |\n';
  }
  return md;
}
function csvToJson(csv: string): ArrayBuffer {
  const rows = csv.trim().split('\n').map(r => parseCSVLine(r));
  if (rows.length < 2) return new TextEncoder().encode('[]').buffer as ArrayBuffer;
  const headers = rows[0];
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = rows[i][j] || '';
    result.push(obj);
  }
  return new TextEncoder().encode(JSON.stringify(result, null, 2)).buffer as ArrayBuffer;
}
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '', inQuotes = false;
  for (const ch of line) {
    if (inQuotes) {
      if (ch === '"') inQuotes = false;
      else current += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

// ====== JSON helper ======
function prettyJson(raw: string): string {
  try { return JSON.stringify(JSON.parse(raw), null, 2); }
  catch { return raw; }
}

// ====== XML helpers ======
function prettyXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tags = xml.replace(/>\s*</g, '><').split(/>\s*</).map(s => s.replace(/^</, '').replace(/>$/, ''));
  for (const tag of tags) {
    const trimmed = tag.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('/')) indent--;
    if (trimmed.startsWith('?') || trimmed.startsWith('!')) {
      formatted += '  '.repeat(Math.max(indent, 0)) + '<' + trimmed + '>\n';
    } else if (trimmed.startsWith('/')) {
      formatted += '  '.repeat(Math.max(indent, 0)) + '<' + trimmed + '>\n';
    } else if (trimmed.endsWith('/')) {
      formatted += '  '.repeat(Math.max(indent, 0)) + '<' + trimmed + '>\n';
    } else {
      formatted += '  '.repeat(Math.max(indent, 0)) + '<' + trimmed + '>\n';
    }
    if (!trimmed.startsWith('/') && !trimmed.endsWith('/') && !trimmed.startsWith('?') && !trimmed.startsWith('!')) indent++;
  }
  return formatted || xml;
}
function xmlToJson(xml: string): ArrayBuffer {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) throw new Error('Invalid XML');
    const result = xmlNodeToJson(doc.documentElement);
    return new TextEncoder().encode(JSON.stringify(result, null, 2)).buffer as ArrayBuffer;
  } catch {
    throw new Error('XML 解析失败，请检查文件格式');
  }
}
function xmlNodeToJson(node: Element): any {
  const obj: any = {};
  for (const attr of Array.from(node.attributes)) obj['@' + attr.name] = attr.value;
  for (const child of Array.from(node.children)) {
    const childJson = xmlNodeToJson(child);
    const name = child.tagName;
    if (obj[name]) {
      if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
      obj[name].push(childJson);
    } else {
      const textNodes = child.childNodes;
      const hasOnlyText = textNodes.length === 1 && textNodes[0].nodeType === 3;
      obj[name] = hasOnlyText ? (textNodes[0].textContent || '') : childJson;
    }
  }
  if (Object.keys(obj).length === 0) return node.textContent || '';
  return obj;
}

// ====== RTF helper ======
function stripRtf(rtf: string): string {
  return rtf
    .replace(/\\\w+\s?/g, '')
    .replace(/[{}]/g, '')
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    .replace(/\\par/g, '\n')
    .replace(/\\tab/g, '\t')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ====== LaTeX helper ======
function stripLatex(tex: string): string {
  return tex
    .replace(/\\\w+\{([^}]*)\}/g, '$1')
    .replace(/\\\w+/g, '')
    .replace(/[{}]/g, '')
    .replace(/\$\$?[^$]+\$\$?/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function convertDocument(
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string,
  onProgress: (p: number) => void, options: ConversionOptions
): Promise<ArrayBuffer> {
  onProgress(10);
  // Map quality slider (60-150) to font size (8-18)
  const pdfFontSize = Math.round(8 + ((options.quality - 60) / 90) * 10);
  if (sourceFormat === 'docx') {
    const result = await mammoth.convertToHtml({ arrayBuffer: fileBuffer });
    onProgress(50);
    const html = result.value;
    if (targetFormat === 'html') return new TextEncoder().encode(html).buffer;
    if (targetFormat === 'txt') return new TextEncoder().encode(stripHtml(html)).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode(htmlToMarkdown(html)).buffer;
    if (targetFormat === 'pdf') return await textToPdf(html, 'html', pdfFontSize);
  }
  if (sourceFormat === 'md') {
    const mdText = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    const html = String(await unified().use(remarkParse).use(remarkHtml).process(mdText));
    onProgress(60);
    if (targetFormat === 'html') return new TextEncoder().encode(html).buffer;
    if (targetFormat === 'txt') return new TextEncoder().encode(stripHtml(html)).buffer;
    if (targetFormat === 'pdf') return await textToPdf(html, 'html', pdfFontSize);
    if (targetFormat === 'docx') throw new Error('MD → DOCX 暂不支持');
  }
  if (sourceFormat === 'html' || sourceFormat === 'htm') {
    const htmlText = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    if (targetFormat === 'txt') return new TextEncoder().encode(stripHtml(htmlText)).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode(htmlToMarkdown(htmlText)).buffer;
    if (targetFormat === 'pdf') return await textToPdf(htmlText, 'html', pdfFontSize);
  }
  // CSV → 文本/表格格式
  if (sourceFormat === 'csv') {
    const csvText = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    if (targetFormat === 'txt') return new TextEncoder().encode(csvText).buffer;
    if (targetFormat === 'json') return csvToJson(csvText);
    if (targetFormat === 'html') return new TextEncoder().encode(csvToHtmlTable(csvText)).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode(csvToMarkdownTable(csvText)).buffer;
    if (targetFormat === 'pdf') return await textToPdf(csvToHtmlTable(csvText), 'html', pdfFontSize);
  }
  // JSON → 美化/转换
  if (sourceFormat === 'json') {
    const jsonText = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    const formatted = prettyJson(jsonText);
    if (targetFormat === 'txt' || targetFormat === 'json') return new TextEncoder().encode(formatted).buffer;
    if (targetFormat === 'html') return new TextEncoder().encode(`<html><body><pre>${escapeHtml(formatted)}</pre></body></html>`).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode('```json\n' + formatted + '\n```').buffer;
    if (targetFormat === 'pdf') return await textToPdf(formatted, 'text', pdfFontSize);
  }
  // XML → 文本/格式化
  if (sourceFormat === 'xml') {
    const xmlText = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    const formatted = prettyXml(xmlText);
    if (targetFormat === 'txt') return new TextEncoder().encode(formatted).buffer;
    if (targetFormat === 'html') return new TextEncoder().encode(`<html><body><pre>${escapeHtml(formatted)}</pre></body></html>`).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode('```xml\n' + formatted + '\n```').buffer;
    if (targetFormat === 'json') return xmlToJson(xmlText);
    if (targetFormat === 'pdf') return await textToPdf(formatted, 'text', pdfFontSize);
  }
  // RTF → 提取纯文本
  if (sourceFormat === 'rtf') {
    const rtfText = new TextDecoder().decode(fileBuffer);
    const text = stripRtf(rtfText);
    onProgress(50);
    if (targetFormat === 'txt') return new TextEncoder().encode(text).buffer;
    if (targetFormat === 'html') return new TextEncoder().encode(`<html><body><pre>${escapeHtml(text)}</pre></body></html>`).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode(text).buffer;
    if (targetFormat === 'pdf') return await textToPdf(text, 'text', pdfFontSize);
  }
  // LaTeX → 纯文本
  if (sourceFormat === 'tex') {
    const texText = new TextDecoder().decode(fileBuffer);
    const text = stripLatex(texText);
    onProgress(50);
    if (targetFormat === 'txt') return new TextEncoder().encode(text).buffer;
    if (targetFormat === 'html') return new TextEncoder().encode(`<html><body><pre>${escapeHtml(text)}</pre></body></html>`).buffer;
    if (targetFormat === 'md') return new TextEncoder().encode(text).buffer;
    if (targetFormat === 'pdf') return await textToPdf(text, 'text', pdfFontSize);
  }
  // Office 文档（DOC/PPT/XLS/ODT）→ 暂无深度支持，提示
  if (['doc', 'odt', 'pptx', 'ppt', 'xlsx', 'xls', 'epub'].includes(sourceFormat)) {
    throw new Error(`${sourceFormat.toUpperCase()} 格式暂不支持深度转换，建议先导出为 PDF 或 TXT 后再转换`);
  }
  if (sourceFormat === 'txt') {
    const text = new TextDecoder().decode(fileBuffer);
    onProgress(30);
    if (targetFormat === 'html') {
      return new TextEncoder().encode(`<html><body><pre>${escapeHtml(text)}</pre></body></html>`).buffer;
    }
    if (targetFormat === 'md') return fileBuffer;
    if (targetFormat === 'pdf') return await textToPdf(text, 'text', pdfFontSize);
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
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string,
  onProgress: (p: number) => void, options: ConversionOptions
): Promise<ArrayBuffer> {
  const ff = await getFFmpeg();
  const inputExt = sourceFormat === 'jpg' ? 'jpeg' : sourceFormat;
  const outputExt = targetFormat === 'jpg' ? 'jpeg' : targetFormat;
  const inputName = `input.${inputExt}`;
  const outputName = `output.${outputExt}`;
  await ff.writeFile(inputName, new Uint8Array(fileBuffer));
  onProgress(15);

  const args = ['-i', inputName];

  // Video quality (CRF: lower=better, 18-51, maps from quality 1-100)
  const crf = Math.round(51 - ((options.quality ?? 78) / 100) * 33);
  args.push('-crf', String(crf));

  // Video resolution
  if (options.videoResolution && options.videoResolution !== 'original') {
    args.push('-vf', `scale=${options.videoResolution}`);
  }

  // Audio bitrate
  args.push('-b:a', options.audioBitrate || '192k');

  args.push(outputName);
  await ff.exec(args);
  onProgress(90);
  const data = await ff.readFile(outputName);
  onProgress(100);
  return (data as Uint8Array).buffer.slice(0) as ArrayBuffer;
}

// ====== Hook ======
type EngineFn = (
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string,
  onProgress: (p: number) => void, options: ConversionOptions
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
        options: { quality: 85, audioBitrate: '192k', videoResolution: 'original' },
      });
    }
    setTasks(prev => [...prev, ...newTasks]);
  }, [fileMap]);

  const updateTargetFormat = useCallback((taskId: string, format: string) => {
    updateTask(taskId, { targetFormat: format });
  }, [updateTask]);

  const setOptions = useCallback((taskId: string, options: Partial<ConversionOptions>) => {
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, options: { ...t.options, ...options }
    } : t));
  }, []);

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
        (progress) => updateTask(taskId, { progress }),
        task.options
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

  return { tasks, addFiles, updateTargetFormat, setOptions, removeTask, clearTasks, startConversion, startAll };
}
