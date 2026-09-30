"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_js_1 = require("../services/authService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password, targetRoles } = req.body;
            if (!name || !email || !password) {
                (0, apiResponse_js_1.sendError)(res, 'Name, email, and password are required', null, 400);
                return;
            }
            const result = await authService_js_1.AuthService.register({ name, email, password, targetRoles });
            (0, apiResponse_js_1.sendSuccess)(res, 'User registered successfully', result, 201);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                (0, apiResponse_js_1.sendError)(res, 'Email and password are required', null, 400);
                return;
            }
            const result = await authService_js_1.AuthService.login({ email, password });
            (0, apiResponse_js_1.sendSuccess)(res, 'User logged in successfully', result, 200);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 401);
        }
    }
    static async logout(req, res) {
        (0, apiResponse_js_1.sendSuccess)(res, 'Logged out successfully', null, 200);
    }
    static async getMe(req, res) {
        try {
            if (!req.user?.userId) {
                (0, apiResponse_js_1.sendError)(res, 'Unauthorized', null, 401);
                return;
            }
            const user = await authService_js_1.AuthService.getProfile(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Current user profile retrieved successfully', user, 200);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.AuthController = AuthController;
