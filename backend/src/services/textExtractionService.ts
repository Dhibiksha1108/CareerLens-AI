import mammoth from 'mammoth';
import path from 'path';

// Polyfill DOMMatrix for Node.js 24 environment before pdf-parse loads
if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

export class TextExtractionService {
  /**
   * Extracts raw text from PDF or DOCX buffer based on file extension or mimeType
   */
  static async extractText(buffer: Buffer, originalName: string, mimeType?: string): Promise<string> {
    const ext = path.extname(originalName).toLowerCase();

    if (ext === '.pdf' || mimeType === 'application/pdf') {
      return await this.extractFromPdf(buffer);
    }

    if (
      ext === '.docx' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return await this.extractFromDocx(buffer);
    }

    throw new Error(`Unsupported file type: ${ext || mimeType}. Only PDF and DOCX files are allowed.`);
  }

  private static async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      if (typeof (globalThis as any).DOMMatrix === 'undefined') {
        (globalThis as any).DOMMatrix = class DOMMatrix {
          a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        };
      }
      const pdfParseModule = await import('pdf-parse');
      const parse = (pdfParseModule as any).default || pdfParseModule;
      const data = await parse(buffer);
      const text = data.text?.trim() || '';
      if (!text) {
        throw new Error('No readable text found in PDF document.');
      }
      return text;
    } catch (err: any) {
      throw new Error(`PDF text extraction failed: ${err.message}`);
    }
  }

  private static async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim() || '';
      if (!text) {
        throw new Error('No readable text found in DOCX document.');
      }
      return text;
    } catch (err: any) {
      throw new Error(`DOCX text extraction failed: ${err.message}`);
    }
  }
}
