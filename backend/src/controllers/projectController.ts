import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { ProjectService } from '../services/projectService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class ProjectController {
  static async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title } = req.body;
      if (!title) {
        sendError(res, 'Project title is required', null, 400);
        return;
      }
      const project = await ProjectService.createProject(req.user!.userId, req.body);
      sendSuccess(res, 'Project created successfully', project, 201);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      const projects = await ProjectService.getUserProjects(req.user!.userId);
      sendSuccess(res, 'Projects retrieved successfully', projects);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async getProjectById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const project = await ProjectService.getProjectById(id, req.user!.userId);
      sendSuccess(res, 'Project details retrieved successfully', project);
    } catch (error) {
      sendError(res, (error as Error).message, null, 404);
    }
  }

  static async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updatedProject = await ProjectService.updateProject(id, req.user!.userId, req.body);
      sendSuccess(res, 'Project updated successfully', updatedProject);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }

  static async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await ProjectService.deleteProject(id, req.user!.userId);
      sendSuccess(res, 'Project deleted successfully', result);
    } catch (error) {
      sendError(res, (error as Error).message, null, 400);
    }
  }
}
