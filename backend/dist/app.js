"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Global DOMMatrix polyfill for Node.js 24 environment (pdf-parse compatibility)
if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
        a = 1;
        b = 0;
        c = 0;
        d = 1;
        e = 0;
        f = 0;
    };
}
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_js_1 = __importDefault(require("./routes/index.js"));
const notFoundMiddleware_js_1 = require("./middleware/notFoundMiddleware.js");
const errorMiddleware_js_1 = require("./middleware/errorMiddleware.js");
const app = (0, express_1.default)();
// Global Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        service: 'CareerLens AI Backend API',
        timestamp: new Date().toISOString()
    });
});
// API Routes Base Mount
app.use('/api', index_js_1.default);
// Error Handling Middlewares
app.use(notFoundMiddleware_js_1.notFound);
app.use(errorMiddleware_js_1.errorHandler);
exports.default = app;
