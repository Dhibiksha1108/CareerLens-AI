import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data: T = {} as T,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  errorDetails: any = null,
  statusCode: number = 500
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errorDetails && { error: errorDetails })
  };
  return res.status(statusCode).json(response);
};
