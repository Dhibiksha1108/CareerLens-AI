import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, targetRoles } = req.body;
      if (!name || !email || !password) {
        sendError(res, 'Name, email, and password are required', null, 400);
        return;
      }

      const result = await AuthService.register({ name, email, password, targetRoles });
      sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        sendError(res, 'Email and password are required', null, 400);
        return;
      }

      const result = await AuthService.login({ email, password });
      sendSuccess(res, 'User logged in successfully', result, 200);
    } catch (error) {
      sendError(res, (error as Error).message, null, 401);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    sendSuccess(res, 'Logged out successfully', null, 200);
  }

  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        sendError(res, 'Unauthorized', null, 401);
        return;
      }
      const user = await AuthService.getProfile(req.user.userId);
      sendSuccess(res, 'Current user profile retrieved successfully', user, 200);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
