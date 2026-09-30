"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const apiResponse_js_1 = require("../utils/apiResponse.js");
const notFound = (req, res, next) => {
    (0, apiResponse_js_1.sendError)(res, `Route Not Found - ${req.originalUrl}`, null, 404);
};
exports.notFound = notFound;
