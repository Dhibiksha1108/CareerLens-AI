import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { AuthRequest } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, targetRoles } = req.body;
      if (!name || !email || !password) {
        sendError(res, 'Please provide name, email, and password', null, 400);
        return;
      }

      const result = await AuthService.register({ name, email, password, targetRoles });
      sendSuccess(res, 'User registered successfully', result, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Registration failed', null, 400);
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        sendError(res, 'Please provide email and password', null, 400);
        return;
      }

      const result = await AuthService.login({ email, password });
      sendSuccess(res, 'Logged in successfully', result);
    } catch (error: any) {
      sendError(res, error.message || 'Login failed', null, 401);
    }
  }

  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await AuthService.getProfile(req.user!.userId);
      sendSuccess(res, 'Profile retrieved successfully', user);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve profile', null, 404);
    }
  }
}
