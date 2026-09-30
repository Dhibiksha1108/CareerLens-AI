import { Project } from '../models/Project.js';

export class ProjectService {
  static async createProject(userId: string, projectData: any) {
    return await Project.create({
      userId,
      ...projectData
    });
  }

  static async getUserProjects(userId: string) {
    return await Project.find({ userId }).sort({ createdAt: -1 });
  }

  static async getProjectById(projectId: string, userId: string) {
    const project = await Project.findOne({ _id: projectId, userId });
    if (!project) throw new Error('Project not found');
    return project;
  }

  static async updateProject(projectId: string, userId: string, updates: any) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      updates,
      { new: true }
    );
    if (!project) throw new Error('Project not found or unauthorized');
    return project;
  }

  static async deleteProject(projectId: string, userId: string) {
    const res = await Project.deleteOne({ _id: projectId, userId });
    if (res.deletedCount === 0) throw new Error('Project not found or unauthorized');
    return { deleted: true };
  }
}
