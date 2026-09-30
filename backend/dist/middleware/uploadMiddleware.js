"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadResumeSingle = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const apiResponse_js_1 = require("../utils/apiResponse.js");
// Memory storage for fast buffer processing
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.docx'];
    const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
    ];
    if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are supported.'));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
const uploadResumeSingle = (req, res, next) => {
    const singleUpload = upload.single('file');
    singleUpload(req, res, (err) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                (0, apiResponse_js_1.sendError)(res, 'File size exceeds maximum allowed limit of 10MB', null, 400);
                return;
            }
            (0, apiResponse_js_1.sendError)(res, `Upload error: ${err.message}`, null, 400);
            return;
        }
        else if (err) {
            (0, apiResponse_js_1.sendError)(res, err.message, null, 400);
            return;
        }
        next();
    });
};
exports.uploadResumeSingle = uploadResumeSingle;
