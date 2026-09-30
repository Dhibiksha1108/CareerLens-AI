"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioController = void 0;
const portfolioService_js_1 = require("../services/portfolioService.js");
const apiResponse_js_1 = require("../utils/apiResponse.js");
class PortfolioController {
    static async analyzePortfolio(req, res) {
        try {
            const { portfolioUrl } = req.body;
            if (!portfolioUrl) {
                (0, apiResponse_js_1.sendError)(res, 'Portfolio URL is required', null, 400);
                return;
            }
            const portfolio = await portfolioService_js_1.PortfolioService.analyzePortfolio(req.user.userId, portfolioUrl);
            (0, apiResponse_js_1.sendSuccess)(res, 'Portfolio analysis initiated successfully', portfolio, 202);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
    static async getMyPortfolios(req, res) {
        try {
            const portfolios = await portfolioService_js_1.PortfolioService.getUserPortfolios(req.user.userId);
            (0, apiResponse_js_1.sendSuccess)(res, 'User portfolio records retrieved successfully', portfolios);
        }
        catch (error) {
            (0, apiResponse_js_1.sendError)(res, error.message, null, 400);
        }
    }
}
exports.PortfolioController = PortfolioController;
