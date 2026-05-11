import type { ConversionEngine } from './types';
import mammoth from 'mammoth';
import { PDFDocument } from 'pdf-lib';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';

export const documentEngine: ConversionEngine = {
  async convert(fileBuffer, sourceFormat, targetFormat, onProgress) {
    onProgress(10);

    // DOCX → anything
    if (sourceFormat === 'docx') {
      const result = await mammoth.convertToHtml({ arrayBuffer: fileBuffer });
      onProgress(50);
      const html = result.value;

      if (targetFormat === 'html') {
        return new TextEncoder().encode(html).buffer;
      }
      if (targetFormat === 'txt') {
        const txt = stripHtml(html);
        return new TextEncoder().encode(txt).buffer;
      }
      if (targetFormat === 'md') {
        const md = htmlToMarkdown(html);
        return new TextEncoder().encode(md).buffer;
      }
      if (targetFormat === 'pdf') {
        return await textToPdf(html, 'html');
      }
    }

    // Markdown → anything
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

    // HTML → anything
    if (sourceFormat === 'html') {
      const htmlText = new TextDecoder().decode(fileBuffer);
      onProgress(30);

      if (targetFormat === 'txt') return new TextEncoder().encode(stripHtml(htmlText)).buffer;
      if (targetFormat === 'md') return new TextEncoder().encode(htmlToMarkdown(htmlText)).buffer;
      if (targetFormat === 'pdf') return await textToPdf(htmlText, 'html');
    }

    // TXT → anything
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

    // PDF → text/html
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
  },
};

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

async function textToPdf(content: string, inputType: 'html' | 'text'): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const fontSize = 12;
  const lineHeight = fontSize * 1.5;
  const margin = 50;

  let text = inputType === 'html' ? stripHtml(content) : content;

  const lines = wrapText(text, fontSize, 595 - margin * 2);
  let y = 842 - margin;

  for (const line of lines) {
    if (y < margin) break;
    page.drawText(line, { x: margin, y, size: fontSize });
    y -= lineHeight;
  }

  return (await pdfDoc.save()).buffer as ArrayBuffer;
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
