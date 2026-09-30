"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextExtractionService = void 0;
const mammoth_1 = __importDefault(require("mammoth"));
const path_1 = __importDefault(require("path"));
// Polyfill DOMMatrix for Node.js 24 environment before pdf-parse loads
if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
        a = 1;
        b = 0;
        c = 0;
        d = 1;
        e = 0;
        f = 0;
    };
}
class TextExtractionService {
    /**
     * Extracts raw text from PDF or DOCX buffer based on file extension or mimeType
     */
    static async extractText(buffer, originalName, mimeType) {
        const ext = path_1.default.extname(originalName).toLowerCase();
        if (ext === '.pdf' || mimeType === 'application/pdf') {
            return await this.extractFromPdf(buffer);
        }
        if (ext === '.docx' ||
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimeType === 'application/msword') {
            return await this.extractFromDocx(buffer);
        }
        throw new Error(`Unsupported file type: ${ext || mimeType}. Only PDF and DOCX files are allowed.`);
    }
    static async extractFromPdf(buffer) {
        try {
            if (typeof globalThis.DOMMatrix === 'undefined') {
                globalThis.DOMMatrix = class DOMMatrix {
                    a = 1;
                    b = 0;
                    c = 0;
                    d = 1;
                    e = 0;
                    f = 0;
                };
            }
            const pdfParseModule = await import('pdf-parse');
            const parse = pdfParseModule.default || pdfParseModule;
            const data = await parse(buffer);
            const text = data.text?.trim() || '';
            if (!text) {
                throw new Error('No readable text found in PDF document.');
            }
            return text;
        }
        catch (err) {
            throw new Error(`PDF text extraction failed: ${err.message}`);
        }
    }
    static async extractFromDocx(buffer) {
        try {
            const result = await mammoth_1.default.extractRawText({ buffer });
            const text = result.value?.trim() || '';
            if (!text) {
                throw new Error('No readable text found in DOCX document.');
            }
            return text;
        }
        catch (err) {
            throw new Error(`DOCX text extraction failed: ${err.message}`);
        }
    }
}
exports.TextExtractionService = TextExtractionService;
