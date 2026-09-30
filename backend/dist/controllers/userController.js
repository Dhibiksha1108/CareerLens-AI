"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_js_1 = require("../services/userService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class UserController {
    static async getProfile(req, res) {
        try {
            const user = await userService_js_1.UserService.getUserProfile(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'User profile retrieved successfully', user);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async updateProfile(req, res) {
        try {
            const updatedUser = await userService_js_1.UserService.updateUserProfile(req.user.userId, req.body);
            (0, apiResponse_js_1.sendSuccess)(res, 'Profile updated successfully', updatedUser);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async updateTargetRoles(req, res) {
        try {
            const { targetRoles, skills } = req.body;
            const updatedUser = await userService_js_1.UserService.updateTargetRoles(req.user.userId, targetRoles || [], skills);
            (0, apiResponse_js_1.sendSuccess)(res, 'Target roles updated successfully', updatedUser);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.UserController = UserController;
