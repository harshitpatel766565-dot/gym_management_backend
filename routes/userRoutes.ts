import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import { updateProfile } from "../controllers/userController";
import {
  getProgressLogs,
  addProgressLog,
} from "../controllers/progressController";

const router = Router();

// Profile Routes
router.patch(
  "/:userId/profile",
  authMiddleware,
  updateProfile
);

// Progress Routes
router.get(
  "/:userId/progress",
  authMiddleware,
  getProgressLogs
);

router.post(
  "/:userId/progress",
  authMiddleware,
  addProgressLog
);

export default router;
