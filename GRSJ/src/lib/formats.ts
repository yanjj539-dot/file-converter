import type { FileCategory } from './types';

interface FormatInfo {
  extension: string;
  mime: string;
  category: FileCategory;
  label: string;
}

export const FORMATS: Record<string, FormatInfo> = {
  png:  { extension: 'png',  mime: 'image/png',       category: 'image',    label: 'PNG' },
  jpeg: { extension: 'jpg',  mime: 'image/jpeg',      category: 'image',    label: 'JPEG' },
  webp: { extension: 'webp', mime: 'image/webp',      category: 'image',    label: 'WebP' },
  bmp:  { extension: 'bmp',  mime: 'image/bmp',       category: 'image',    label: 'BMP' },
  ico:  { extension: 'ico',  mime: 'image/x-icon',    category: 'image',    label: 'ICO' },
  heic: { extension: 'heic', mime: 'image/heic',      category: 'image',    label: 'HEIC' },
  avif: { extension: 'avif', mime: 'image/avif',      category: 'image',    label: 'AVIF' },
  tiff: { extension: 'tiff', mime: 'image/tiff',      category: 'image',    label: 'TIFF' },
  svg:  { extension: 'svg',  mime: 'image/svg+xml',   category: 'image',    label: 'SVG' },

  pdf:  { extension: 'pdf',  mime: 'application/pdf', category: 'document', label: 'PDF' },
  docx: { extension: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document', label: 'DOCX' },
  txt:  { extension: 'txt',  mime: 'text/plain',      category: 'document', label: 'TXT' },
  md:   { extension: 'md',   mime: 'text/markdown',   category: 'document', label: 'Markdown' },
  html: { extension: 'html', mime: 'text/html',        category: 'document', label: 'HTML' },

  mp4:  { extension: 'mp4',  mime: 'video/mp4',       category: 'video',    label: 'MP4' },
  mov:  { extension: 'mov',  mime: 'video/quicktime', category: 'video',    label: 'MOV' },
  avi:  { extension: 'avi',  mime: 'video/x-msvideo', category: 'video',    label: 'AVI' },
  mkv:  { extension: 'mkv',  mime: 'video/x-matroska',category: 'video',    label: 'MKV' },
  webm: { extension: 'webm', mime: 'video/webm',      category: 'video',    label: 'WebM' },
  gif:  { extension: 'gif',  mime: 'image/gif',       category: 'video',    label: 'GIF' },

  mp3:  { extension: 'mp3',  mime: 'audio/mpeg',      category: 'audio',    label: 'MP3' },
  wav:  { extension: 'wav',  mime: 'audio/wav',       category: 'audio',    label: 'WAV' },
  ogg:  { extension: 'ogg',  mime: 'audio/ogg',       category: 'audio',    label: 'OGG' },
  flac: { extension: 'flac', mime: 'audio/flac',      category: 'audio',    label: 'FLAC' },
  aac:  { extension: 'aac',  mime: 'audio/aac',       category: 'audio',    label: 'AAC' },
};

export function getFormatByExtension(ext: string): FormatInfo | undefined {
  return FORMATS[ext.toLowerCase()];
}

export function getFormatByMime(mime: string): FormatInfo | undefined {
  return Object.values(FORMATS).find(f => f.mime === mime);
}

export function detectCategory(file: File): FileCategory | null {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext) {
    const fmt = FORMATS[ext];
    if (fmt) return fmt.category;
  }
  const mimeFmt = getFormatByMime(file.type);
  if (mimeFmt) return mimeFmt.category;
  return null;
}

export function getTargetFormats(sourceExt: string): FormatInfo[] {
  const src = FORMATS[sourceExt.toLowerCase()];
  if (!src) return [];
  return Object.values(FORMATS).filter(
    f => f.category === src.category && f.extension !== src.extension
  );
}

export function getAcceptedExtensions(): string {
  return Object.values(FORMATS)
    .map(f => `.${f.extension}`)
    .join(',');
}
