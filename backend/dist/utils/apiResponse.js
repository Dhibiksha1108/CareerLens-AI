"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data = {}, statusCode = 200) => {
    const response = {
        success: true,
        message,
        data
    };
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, errorDetails = null, statusCode = 500) => {
    const response = {
        success: false,
        message,
        ...(errorDetails && { error: errorDetails })
    };
    return res.status(statusCode).json(response);
};
exports.sendError = sendError;
