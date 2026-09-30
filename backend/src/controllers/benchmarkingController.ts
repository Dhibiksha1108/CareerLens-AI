import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { BenchmarkingService } from '../services/benchmarkingService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class BenchmarkingController {
  static async getBenchmarks(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await BenchmarkingService.getBenchmarkMetrics(req.user!.userId);
      sendSuccess(res, 'Career benchmark metrics retrieved successfully', data);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
