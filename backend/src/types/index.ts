import { Request } from 'express';

export interface AuthUserPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}
