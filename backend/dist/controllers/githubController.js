"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubController = void 0;
const githubService_js_1 = require("../services/githubService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class GitHubController {
    static async syncProfile(req, res) {
        try {
            const { username } = req.body;
            if (!username) {
                (0, apiResponse_js_1.sendError)(res, 'GitHub username is required', null, 400);
                return;
            }
            const profile = await githubService_js_1.GitHubService.syncGitHubProfile(req.user.userId, username);
            (0, apiResponse_js_1.sendSuccess)(res, 'GitHub profile sync initiated', profile);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async getMyProfile(req, res) {
        try {
            const profile = await githubService_js_1.GitHubService.getUserGitHubProfile(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'GitHub profile data retrieved successfully', profile);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.GitHubController = GitHubController;
