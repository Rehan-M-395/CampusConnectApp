import { Router } from "express";
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware";
import {
  createFacultyGatePass,
  saveFacultyToken,
  triggerFacultyNotification,
  insertSession,
  getTeacherAttendance
} from "../controllers/facultyController";
import upload from "../config/multerConfig";

const router = Router();

console.log("facultyRoutes loaded");

router.post("/gate-pass", authenticateRequest, authorizeRoles("faculty"), createFacultyGatePass);
router.post("/save-token", authenticateRequest, authorizeRoles("faculty"), saveFacultyToken);
router.post("/trigger-notification", authenticateRequest, authorizeRoles("faculty"), triggerFacultyNotification);
router.post("/insert-session", authenticateRequest, upload.array("images"), authorizeRoles("faculty"), insertSession);
router.get(
  "/teacher/:teacherId",
  getTeacherAttendance
);

export default router;
