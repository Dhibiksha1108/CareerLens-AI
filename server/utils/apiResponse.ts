import { Response } from 'express';

export const sendSuccess = <T = any>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (
  res: Response,
  message: string,
  error?: any,
  statusCode: number = 500
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error ? (error.message || error) : undefined
  });
};
