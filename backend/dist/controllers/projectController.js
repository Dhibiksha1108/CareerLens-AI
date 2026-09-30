"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const projectService_js_1 = require("../services/projectService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class ProjectController {
    static async createProject(req, res) {
        try {
            const { title } = req.body;
            if (!title) {
                (0, apiResponse_js_1.sendError)(res, 'Project title is required', null, 400);
                return;
            }
            const project = await projectService_js_1.ProjectService.createProject(req.user.userId, req.body);
            (0, apiResponse_js_1.sendSuccess)(res, 'Project created successfully', project, 201);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async getProjects(req, res) {
        try {
            const projects = await projectService_js_1.ProjectService.getUserProjects(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Projects retrieved successfully', projects);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async getProjectById(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const project = await projectService_js_1.ProjectService.getProjectById(id, req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Project details retrieved successfully', project);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 404);
        }
    }
    static async updateProject(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const updatedProject = await projectService_js_1.ProjectService.updateProject(id, req.user.userId, req.body);
            (0, apiResponse_js_1.sendSuccess)(res, 'Project updated successfully', updatedProject);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async deleteProject(req, res) {
        try {
            const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
            const result = await projectService_js_1.ProjectService.deleteProject(id, req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Project deleted successfully', result);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.ProjectController = ProjectController;
