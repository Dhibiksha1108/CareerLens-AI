"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubService = void 0;
const GitHubProfile_js_1 = require("../models/GitHubProfile.js");
class GitHubService {
    static async syncGitHubProfile(userId, username) {
        let profile = await GitHubProfile_js_1.GitHubProfile.findOne({ userId, username });
        if (!profile) {
            profile = await GitHubProfile_js_1.GitHubProfile.create({
                userId,
                username,
                repositories: [],
                languages: {},
                analyzedSkills: []
            });
        }
        return profile;
    }
    static async getUserGitHubProfile(userId) {
        return await GitHubProfile_js_1.GitHubProfile.findOne({ userId });
    }
}
exports.GitHubService = GitHubService;
