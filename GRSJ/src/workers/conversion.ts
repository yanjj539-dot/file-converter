// ====== Types ======
type WorkerRequest = {
  id: string;
  sourceType: 'image' | 'document' | 'audio' | 'video';
  sourceFormat: string;
  targetFormat: string;
  fileBuffer: ArrayBuffer;
};

// ====== Messaging ======
function postProgress(id: string, progress: number) {
  self.postMessage({ type: 'progress', id, progress });
}
function postDone(id: string, resultBuffer: ArrayBuffer) {
  self.postMessage({ type: 'done', id, resultBuffer }, [resultBuffer]);
}
function postError(id: string, error: string) {
  self.postMessage({ type: 'error', id, error });
}

// ====== Image Engine ======
async function convertImage(
  fileBuffer: ArrayBuffer, sourceFormat: string, targetFormat: string, onProgress: (p: number) => void
): Promise<ArrayBuffer> {
  onProgress(10);
  const blob = new Blob([fileBuffer]);
  const sourceUrl = URL.createObjectURL(blob);
  try {
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
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

// ====== Audio/Video Engine ======
let ffmpeg: any = null;
let ffmpegLoadPromise: Promise<any> | null = null;

async function getFFmpeg(): Promise<any> {
  if (ffmpeg && ffmpeg.loaded) return ffmpeg;
  if (ffmpegLoadPromise) return ffmpegLoadPromise;

  ffmpegLoadPromise = (async () => {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { toBlobURL } = await import('@ffmpeg/util');
    ffmpeg = new FFmpeg();
    const base = new URL('/ffmpeg/ffmpeg-core', self.location.origin).href;
    await ffmpeg.load({
      coreURL: await toBlobURL(base + '.js', 'text/javascript'),
      wasmURL: await toBlobURL(base + '.wasm', 'application/wasm'),
    });
    return ffmpeg;
  })();
  return ffmpegLoadPromise;
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

// ====== Document Engine ======
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
  const { PDFDocument } = await import('pdf-lib');
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
    const mammoth = await import('mammoth');
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
    const { unified } = await import('unified');
    const remarkParse = (await import('remark-parse')).default;
    const remarkHtml = (await import('remark-html')).default;
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
      const html = `<html><body><pre>${escapeHtml(text)}</pre></body></html>`;
      return new TextEncoder().encode(html).buffer;
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
      const html = `<html><body>${pages.map(p => `<p>${escapeHtml(p)}</p>`).join('\n')}</body></html>`;
      return new TextEncoder().encode(html).buffer;
    }
    if (targetFormat === 'md') return new TextEncoder().encode(fullText).buffer;
  }

  throw new Error(`不支持的转换: ${sourceFormat} → ${targetFormat}`);
}

// ====== Router ======
self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, sourceType, sourceFormat, targetFormat, fileBuffer } = e.data;
  try {
    let resultBuffer: ArrayBuffer;
    switch (sourceType) {
      case 'image':
        resultBuffer = await convertImage(fileBuffer, sourceFormat, targetFormat, postProgress.bind(null, id));
        break;
      case 'document':
        resultBuffer = await convertDocument(fileBuffer, sourceFormat, targetFormat, postProgress.bind(null, id));
        break;
      case 'audio':
      case 'video':
        resultBuffer = await convertAudioVideo(fileBuffer, sourceFormat, targetFormat, postProgress.bind(null, id));
        break;
      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }
    postDone(id, resultBuffer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    postError(id, msg || '转换失败');
  }
};
