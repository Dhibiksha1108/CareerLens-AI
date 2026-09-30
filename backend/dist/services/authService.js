"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_js_1 = require("../models/User.js");
const jwt_js_1 = require("../utils/jwt.js");
class AuthService {
    static async register(dto) {
        const existingUser = await User_js_1.User.findOne({ email: dto.email.toLowerCase() });
        if (existingUser) {
            throw new Error('User already exists with this email');
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(dto.password, salt);
        const user = await User_js_1.User.create({
            name: dto.name,
            email: dto.email.toLowerCase(),
            password: hashedPassword,
            targetRoles: dto.targetRoles || ['Full Stack Developer'],
            education: [],
            skills: []
        });
        const token = (0, jwt_js_1.generateToken)({ userId: user._id.toString(), email: user.email });
        const userObj = user.toObject();
        delete userObj.password;
        return { user: userObj, token };
    }
    static async login(dto) {
        const user = await User_js_1.User.findOne({ email: dto.email.toLowerCase() });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        if (!user.password) {
            throw new Error('Invalid email or password');
        }
        const isMatch = await bcryptjs_1.default.compare(dto.password, user.password);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        const token = (0, jwt_js_1.generateToken)({ userId: user._id.toString(), email: user.email });
        const userObj = user.toObject();
        delete userObj.password;
        return { user: userObj, token };
    }
    static async getProfile(userId) {
        const user = await User_js_1.User.findById(userId).select('-password');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
