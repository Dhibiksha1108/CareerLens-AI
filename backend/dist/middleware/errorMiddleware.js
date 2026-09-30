"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiResponse_js_1 = require("../utils/apiResponse.js");
const errorHandler = (err, req, res, next) => {
    console.error('[Error Middleware]', err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const message = err.message || 'Internal Server Error';
    (0, apiResponse_js_1.sendError)(res, message, process.env.NODE_ENV === 'development' ? err.stack : null, statusCode);
};
exports.errorHandler = errorHandler;
