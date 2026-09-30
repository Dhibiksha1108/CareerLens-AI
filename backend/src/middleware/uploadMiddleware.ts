import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

// Memory storage for fast buffer processing
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.docx'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];

  if (allowedExtensions.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are supported.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export const uploadResumeSingle = (req: Request, res: Response, next: NextFunction) => {
  const singleUpload = upload.single('file');

  singleUpload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        sendError(res, 'File size exceeds maximum allowed limit of 10MB', null, 400);
        return;
      }
      sendError(res, `Upload error: ${err.message}`, null, 400);
      return;
    } else if (err) {
      sendError(res, err.message, null, 400);
      return;
    }
    next();
  });
};
