import { Router } from "express";
import {
  authenticateRequest,
  authorizeRoles,
} from "../middleware/authMiddleware";
import { getStudentAttendance } from "../controllers/studentController";

const router = Router();

router.get(
  "/attendance",
  authenticateRequest,
  authorizeRoles("student"),
  getStudentAttendance,
);

export default router;