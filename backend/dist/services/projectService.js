"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const Project_js_1 = require("../models/Project.js");
class ProjectService {
    static async createProject(userId, projectData) {
        return await Project_js_1.Project.create({
            userId,
            ...projectData
        });
    }
    static async getUserProjects(userId) {
        return await Project_js_1.Project.find({ userId }).sort({ createdAt: -1 });
    }
    static async getProjectById(projectId, userId) {
        const project = await Project_js_1.Project.findOne({ _id: projectId, userId });
        if (!project)
            throw new Error('Project not found');
        return project;
    }
    static async updateProject(projectId, userId, updates) {
        const project = await Project_js_1.Project.findOneAndUpdate({ _id: projectId, userId }, updates, { new: true });
        if (!project)
            throw new Error('Project not found or unauthorized');
        return project;
    }
    static async deleteProject(projectId, userId) {
        const res = await Project_js_1.Project.deleteOne({ _id: projectId, userId });
        if (res.deletedCount === 0)
            throw new Error('Project not found or unauthorized');
        return { deleted: true };
    }
}
exports.ProjectService = ProjectService;
