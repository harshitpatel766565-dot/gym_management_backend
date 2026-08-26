import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  getMonthlySummary,
  checkInToday,
} from "../controllers/attendanceController";

const router = Router();

router.get(
  "/user/:userId/summary",
  authMiddleware,
  getMonthlySummary
);

router.post(
  "/checkin",
  authMiddleware,
  checkInToday
);

export default router;
