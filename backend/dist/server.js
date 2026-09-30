"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const env_js_1 = require("./config/env.js");
const db_js_1 = require("./config/db.js");
const startServer = async () => {
    // Connect to MongoDB
    await (0, db_js_1.connectDB)();
    const server = app_js_1.default.listen(env_js_1.config.port, () => {
        console.log(`[Server] CareerLens AI API running in ${env_js_1.config.nodeEnv} mode on port ${env_js_1.config.port}`);
    });
    process.on('unhandledRejection', (err) => {
        console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
    });
};
startServer();
