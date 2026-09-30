"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_js_1 = require("../models/User.js");
class UserService {
    static async getUserProfile(userId) {
        const user = await User_js_1.User.findById(userId).select('-password');
        if (!user)
            throw new Error('User not found');
        return user;
    }
    static async updateUserProfile(userId, updates) {
        if (updates.password) {
            delete updates.password; // Do not allow password updates through profile endpoint
        }
        const user = await User_js_1.User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
        if (!user)
            throw new Error('User not found');
        return user;
    }
    static async updateTargetRoles(userId, targetRoles, skills) {
        const updates = { targetRoles };
        if (skills)
            updates.skills = skills;
        const user = await User_js_1.User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
        if (!user)
            throw new Error('User not found');
        return user;
    }
}
exports.UserService = UserService;
