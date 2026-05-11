import type { FileCategory } from './types';

interface FormatInfo {
  extension: string;
  mime: string;
  category: FileCategory;
  label: string;
}

export const FORMATS: Record<string, FormatInfo> = {
  // ========== 图片 (29种) ==========
  png:  { extension: 'png',  mime: 'image/png',        category: 'image', label: 'PNG' },
  jpeg: { extension: 'jpg',  mime: 'image/jpeg',       category: 'image', label: 'JPEG' },
  webp: { extension: 'webp', mime: 'image/webp',       category: 'image', label: 'WebP' },
  avif: { extension: 'avif', mime: 'image/avif',       category: 'image', label: 'AVIF' },
  jxl:  { extension: 'jxl',  mime: 'image/jxl',        category: 'image', label: 'JPEG XL' },
  bmp:  { extension: 'bmp',  mime: 'image/bmp',        category: 'image', label: 'BMP' },
  tiff: { extension: 'tiff', mime: 'image/tiff',       category: 'image', label: 'TIFF' },
  tif:  { extension: 'tif',  mime: 'image/tiff',       category: 'image', label: 'TIFF' },
  svg:  { extension: 'svg',  mime: 'image/svg+xml',    category: 'image', label: 'SVG' },
  ico:  { extension: 'ico',  mime: 'image/x-icon',     category: 'image', label: 'ICO' },
  heic: { extension: 'heic', mime: 'image/heic',       category: 'image', label: 'HEIC' },
  heif: { extension: 'heif', mime: 'image/heif',       category: 'image', label: 'HEIF' },
  gif:  { extension: 'gif',  mime: 'image/gif',        category: 'image', label: 'GIF' },
  jp2:  { extension: 'jp2',  mime: 'image/jp2',        category: 'image', label: 'JPEG 2000' },
  jpx:  { extension: 'jpx',  mime: 'image/jpx',        category: 'image', label: 'JPEG 2000' },
  psd:  { extension: 'psd',  mime: 'image/vnd.adobe.photoshop', category: 'image', label: 'Photoshop' },
  eps:  { extension: 'eps',  mime: 'application/postscript',    category: 'image', label: 'EPS' },
  tga:  { extension: 'tga',  mime: 'image/x-targa',    category: 'image', label: 'TGA' },
  exr:  { extension: 'exr',  mime: 'image/x-exr',      category: 'image', label: 'OpenEXR' },
  hdr:  { extension: 'hdr',  mime: 'image/vnd.radiance', category: 'image', label: 'HDR' },
  ppm:  { extension: 'ppm',  mime: 'image/x-portable-pixmap', category: 'image', label: 'PPM' },
  pgm:  { extension: 'pgm',  mime: 'image/x-portable-graymap', category: 'image', label: 'PGM' },
  pbm:  { extension: 'pbm',  mime: 'image/x-portable-bitmap', category: 'image', label: 'PBM' },
  dng:  { extension: 'dng',  mime: 'image/x-adobe-dng', category: 'image', label: 'DNG' },
  cr2:  { extension: 'cr2',  mime: 'image/x-canon-cr2', category: 'image', label: 'Canon RAW' },
  nef:  { extension: 'nef',  mime: 'image/x-nikon-nef', category: 'image', label: 'Nikon RAW' },
  arw:  { extension: 'arw',  mime: 'image/x-sony-arw',  category: 'image', label: 'Sony RAW' },
  orf:  { extension: 'orf',  mime: 'image/x-olympus-orf', category: 'image', label: 'Olympus RAW' },
  rw2:  { extension: 'rw2',  mime: 'image/x-panasonic-rw2', category: 'image', label: 'Panasonic RAW' },

  // ========== 文档 (18种) ==========
  pdf:  { extension: 'pdf',  mime: 'application/pdf',  category: 'document', label: 'PDF' },
  docx: { extension: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'document', label: 'DOCX' },
  doc:  { extension: 'doc',  mime: 'application/msword', category: 'document', label: 'DOC' },
  txt:  { extension: 'txt',  mime: 'text/plain',       category: 'document', label: 'TXT' },
  md:   { extension: 'md',   mime: 'text/markdown',    category: 'document', label: 'Markdown' },
  html: { extension: 'html', mime: 'text/html',         category: 'document', label: 'HTML' },
  htm:  { extension: 'htm',  mime: 'text/html',         category: 'document', label: 'HTML' },
  rtf:  { extension: 'rtf',  mime: 'application/rtf',   category: 'document', label: 'RTF' },
  odt:  { extension: 'odt',  mime: 'application/vnd.oasis.opendocument.text', category: 'document', label: 'ODT' },
  csv:  { extension: 'csv',  mime: 'text/csv',          category: 'document', label: 'CSV' },
  json: { extension: 'json', mime: 'application/json',   category: 'document', label: 'JSON' },
  xml:  { extension: 'xml',  mime: 'application/xml',    category: 'document', label: 'XML' },
  pptx: { extension: 'pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'document', label: 'PPTX' },
  ppt:  { extension: 'ppt',  mime: 'application/vnd.ms-powerpoint', category: 'document', label: 'PPT' },
  xlsx: { extension: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'document', label: 'XLSX' },
  xls:  { extension: 'xls',  mime: 'application/vnd.ms-excel', category: 'document', label: 'XLS' },
  epub: { extension: 'epub', mime: 'application/epub+zip', category: 'document', label: 'EPUB' },
  tex:  { extension: 'tex',  mime: 'application/x-tex',  category: 'document', label: 'LaTeX' },

  // ========== 音频 (15种) ==========
  mp3:  { extension: 'mp3',  mime: 'audio/mpeg',       category: 'audio', label: 'MP3' },
  wav:  { extension: 'wav',  mime: 'audio/wav',        category: 'audio', label: 'WAV' },
  ogg:  { extension: 'ogg',  mime: 'audio/ogg',        category: 'audio', label: 'OGG' },
  oga:  { extension: 'oga',  mime: 'audio/ogg',        category: 'audio', label: 'OGG Audio' },
  flac: { extension: 'flac', mime: 'audio/flac',       category: 'audio', label: 'FLAC' },
  aac:  { extension: 'aac',  mime: 'audio/aac',        category: 'audio', label: 'AAC' },
  m4a:  { extension: 'm4a',  mime: 'audio/mp4',        category: 'audio', label: 'M4A' },
  wma:  { extension: 'wma',  mime: 'audio/x-ms-wma',   category: 'audio', label: 'WMA' },
  aiff: { extension: 'aiff', mime: 'audio/aiff',       category: 'audio', label: 'AIFF' },
  aif:  { extension: 'aif',  mime: 'audio/aiff',       category: 'audio', label: 'AIFF' },
  opus: { extension: 'opus', mime: 'audio/opus',       category: 'audio', label: 'Opus' },
  ac3:  { extension: 'ac3',  mime: 'audio/ac3',        category: 'audio', label: 'AC3' },
  amr:  { extension: 'amr',  mime: 'audio/amr',        category: 'audio', label: 'AMR' },
  alac: { extension: 'alac', mime: 'audio/alac',       category: 'audio', label: 'ALAC' },
  mid:  { extension: 'mid',  mime: 'audio/midi',       category: 'audio', label: 'MIDI' },
  midi: { extension: 'midi', mime: 'audio/midi',       category: 'audio', label: 'MIDI' },

  // ========== 视频 (20种) ==========
  mp4:  { extension: 'mp4',  mime: 'video/mp4',        category: 'video', label: 'MP4' },
  mov:  { extension: 'mov',  mime: 'video/quicktime',  category: 'video', label: 'MOV' },
  avi:  { extension: 'avi',  mime: 'video/x-msvideo',  category: 'video', label: 'AVI' },
  mkv:  { extension: 'mkv',  mime: 'video/x-matroska', category: 'video', label: 'MKV' },
  webm: { extension: 'webm', mime: 'video/webm',       category: 'video', label: 'WebM' },
  wmv:  { extension: 'wmv',  mime: 'video/x-ms-wmv',   category: 'video', label: 'WMV' },
  flv:  { extension: 'flv',  mime: 'video/x-flv',      category: 'video', label: 'FLV' },
  m4v:  { extension: 'm4v',  mime: 'video/mp4',        category: 'video', label: 'M4V' },
  mpeg: { extension: 'mpeg', mime: 'video/mpeg',       category: 'video', label: 'MPEG' },
  mpg:  { extension: 'mpg',  mime: 'video/mpeg',       category: 'video', label: 'MPEG' },
  ts:   { extension: 'ts',   mime: 'video/mp2t',       category: 'video', label: 'TS' },
  '3gp':{ extension: '3gp',  mime: 'video/3gpp',       category: 'video', label: '3GP' },
  '3g2':{ extension: '3g2',  mime: 'video/3gpp2',      category: 'video', label: '3G2' },
  ogv:  { extension: 'ogv',  mime: 'video/ogg',        category: 'video', label: 'OGV' },
  vob:  { extension: 'vob',  mime: 'video/dvd',        category: 'video', label: 'VOB' },
  hevc: { extension: 'hevc', mime: 'video/hevc',       category: 'video', label: 'HEVC/H.265' },
  divx: { extension: 'divx', mime: 'video/divx',       category: 'video', label: 'DivX' },
  xvid: { extension: 'xvid', mime: 'video/x-xvid',     category: 'video', label: 'Xvid' },
  rm:   { extension: 'rm',   mime: 'application/vnd.rn-realmedia', category: 'video', label: 'RealMedia' },
  rmvb: { extension: 'rmvb', mime: 'application/vnd.rn-realmedia-vbr', category: 'video', label: 'RMVB' },
};

/** 图片可写入格式（Canvas API 支持编码的输出） */
const IMAGE_WRITABLE = new Set(['png', 'jpeg', 'webp', 'avif', 'bmp', 'ico']);

/** 获取源格式支持的目标转换格式 */
export function getTargetFormats(sourceExt: string): FormatInfo[] {
  const src = FORMATS[sourceExt.toLowerCase()];
  if (!src) return [];

  if (src.category === 'image') {
    // 图片 → 任意 Canvas 可写格式
    return Object.values(FORMATS).filter(
      f => IMAGE_WRITABLE.has(f.extension) && f.extension !== src.extension
    );
  }

  // 文档、音频、视频 → 同类别所有其他格式
  return Object.values(FORMATS).filter(
    f => f.category === src.category && f.extension !== src.extension
  );
}

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

export function getAcceptedExtensions(): string {
  return Object.values(FORMATS)
    .map(f => `.${f.extension}`)
    .join(',');
}
