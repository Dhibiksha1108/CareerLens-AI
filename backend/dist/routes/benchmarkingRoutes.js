"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const benchmarkingController_js_1 = require("../controllers/benchmarkingController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
router.use(authMiddleware_js_1.protect);
router.get('/', benchmarkingController_js_1.BenchmarkingController.getBenchmarks);
exports.default = router;
