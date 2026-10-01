import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { TokenPayload } from '../types/index.js';

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: (config.jwtExpiresIn || '7d') as any
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
};
