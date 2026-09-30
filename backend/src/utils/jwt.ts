import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuthUserPayload } from '../types/index.js';

export const generateToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any
  });
};

export const verifyToken = (token: string): AuthUserPayload => {
  return jwt.verify(token, config.jwtSecret) as AuthUserPayload;
};
