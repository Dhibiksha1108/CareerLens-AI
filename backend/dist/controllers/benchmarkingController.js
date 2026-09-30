"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkingController = void 0;
const benchmarkingService_js_1 = require("../services/benchmarkingService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class BenchmarkingController {
    static async getBenchmarks(req, res) {
        try {
            const data = await benchmarkingService_js_1.BenchmarkingService.getBenchmarkMetrics(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'Career benchmark metrics retrieved successfully', data);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.BenchmarkingController = BenchmarkingController;
