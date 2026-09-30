"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_js_1 = require("./env.js");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_js_1.config.mongoUri, {
            serverSelectionTimeoutMS: 3000
        });
        console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`[Database] Error connecting to MongoDB: ${error.message}`);
        console.warn('[Database] Running in disconnected state. Ensure MongoDB is running for data persistence.');
    }
};
exports.connectDB = connectDB;
