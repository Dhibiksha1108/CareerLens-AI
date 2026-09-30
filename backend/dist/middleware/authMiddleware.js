"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
const protect = (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            (0, apiResponse_js_1.sendError)(res, 'Not authorized. Access token missing.', null, 401);
            return;
        }
        const decoded = (0, jwt_js_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        (0, apiResponse_js_1.sendError)(res, 'Not authorized. Invalid or expired token.', error.message, 401);
    }
};
exports.protect = protect;
