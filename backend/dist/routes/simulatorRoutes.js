"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const simulatorController_js_1 = require("../controllers/simulatorController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
router.use(authMiddleware_js_1.protect);
router.post('/simulate', simulatorController_js_1.SimulatorController.simulate);
exports.default = router;
