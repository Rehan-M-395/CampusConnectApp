"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// POST /api/save-token - Save FCM token (requires auth)
router.post('/save-token', authMiddleware_1.authenticateRequest, notificationController_1.saveToken);
// POST /api/trigger-notification - Manually trigger notification (for testing)
router.post('/trigger-notification', authMiddleware_1.authenticateRequest, notificationController_1.triggerNotification);
exports.default = router;
