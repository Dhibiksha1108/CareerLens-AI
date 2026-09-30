import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  sendError(res, `Route Not Found - ${req.originalUrl}`, null, 404);
};
