"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioService = void 0;
const Portfolio_js_1 = require("../models/Portfolio.js");
class PortfolioService {
    static async analyzePortfolio(userId, portfolioUrl) {
        let portfolio = await Portfolio_js_1.Portfolio.findOne({ userId, portfolioUrl });
        if (!portfolio) {
            portfolio = await Portfolio_js_1.Portfolio.create({
                userId,
                portfolioUrl,
                analysisStatus: 'pending',
                skills: [],
                projects: []
            });
        }
        else {
            portfolio.analysisStatus = 'pending';
            await portfolio.save();
        }
        return portfolio;
    }
    static async getUserPortfolios(userId) {
        return await Portfolio_js_1.Portfolio.find({ userId }).sort({ createdAt: -1 });
    }
}
exports.PortfolioService = PortfolioService;
