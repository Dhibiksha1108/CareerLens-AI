import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../types/index.js';

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    sendError(res, 'Not authorized, no token provided', null, 401);
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    next();
  } catch {
    sendError(res, 'Not authorized, token invalid or expired', null, 401);
  }
};
