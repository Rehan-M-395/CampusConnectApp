"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const studentController_1 = require("../controllers/studentController");
const router = (0, express_1.Router)();
router.get("/attendance", authMiddleware_1.authenticateRequest, (0, authMiddleware_1.authorizeRoles)("student"), studentController_1.getStudentAttendance);
exports.default = router;
