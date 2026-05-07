import { Router } from "express";
import { authenticateRequest, authorizeRoles } from "../middleware/authMiddleware";
import {
  createGatePass,
  listGuardHistory,
  listGatePasses,
  markGatePassIn,
  markGatePassOut,
  scanGatePass,
} from "../controllers/gatePassController";

const router = Router();

router.post("/", authenticateRequest, authorizeRoles("faculty"), createGatePass);
router.get("/", authenticateRequest, authorizeRoles("guard"), listGatePasses);
router.get("/history", authenticateRequest, authorizeRoles("guard"), listGuardHistory);
router.post("/scan", authenticateRequest, authorizeRoles("guard"), scanGatePass);
router.post("/:id/mark-in", authenticateRequest, authorizeRoles("guard"), markGatePassIn);
router.post("/:id/mark-out", authenticateRequest, authorizeRoles("guard"), markGatePassOut);

export default router;
