import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export class TextExtractionService {
  static async extractText(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const ext = filename.toLowerCase().split('.').pop() || '';

    try {
      if (ext === 'pdf' || mimeType === 'application/pdf') {
        return await this.extractFromPdf(buffer);
      }

      if (ext === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return await this.extractFromDocx(buffer);
      }

      if (ext === 'doc' || mimeType === 'application/msword') {
        return await this.extractFromDocx(buffer);
      }

      throw new Error(`Unsupported file format: ${ext || mimeType}`);
    } catch (error) {
      console.error('[TextExtraction] Error extracting text:', error);
      throw new Error(`Failed to extract text from ${filename}: ${(error as Error).message}`);
    }
  }

  private static async extractFromPdf(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);
    return (data.text || '').trim();
  }

  private static async extractFromDocx(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || '').trim();
  }
}
