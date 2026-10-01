import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export class TextExtractionService {
  static async extractText(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
    const ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();

    try {
      if (ext === '.pdf' || mimeType.includes('pdf')) {
        const data = await (pdfParse as any)(buffer);
        return data.text ? data.text.trim() : '';
      }

      if (ext === '.docx' || mimeType.includes('word') || mimeType.includes('document')) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value ? result.value.trim() : '';
      }
    } catch (err: any) {
      console.warn(`[TextExtractionService] Extraction error for ${originalName}:`, err.message);
    }

    // Fallback: try utf-8 string
    return buffer.toString('utf-8').trim();
  }
}
