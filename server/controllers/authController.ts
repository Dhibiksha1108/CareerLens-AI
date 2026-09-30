import { Response } from 'express';
import { AuthService } from '../services/authService.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class AuthController {
  static async register(req: AuthRequest, res: Response): Promise<void> {
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

  static async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        sendError(res, 'Email and password are required', null, 400);
        return;
      }
      const result = await AuthService.login({ email, password });
      sendSuccess(res, 'Login successful', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 401);
    }
  }

  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await AuthService.getProfile(req.user!.userId);
      sendSuccess(res, 'Current user profile retrieved', user);
    } catch (error) {
      sendError(res, (error as Error).message, null, 404);
    }
  }

  static async logout(_req: AuthRequest, res: Response): Promise<void> {
    sendSuccess(res, 'Logout successful', null);
  }
}
