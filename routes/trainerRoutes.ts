import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware";
import trainerMiddleware from "../middleware/trainerMiddleware";

import {
  getTrainerDashboard,
  getTrainerMembers,
  getAvailableMembers,
  assignMemberToTrainer,
  removeMemberFromTrainer,
  addMemberToTrainer,
  getMemberProfile,
} from "../controllers/trainerController";

const router = Router();

// Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  trainerMiddleware,
  getTrainerDashboard
);

// Assigned members
router.get(
  "/members",
  authMiddleware,
  trainerMiddleware,
  getTrainerMembers
);

// Available members
router.get(
  "/available-members",
  authMiddleware,
  trainerMiddleware,
  getAvailableMembers
);

// Add member
router.post(
  "/members",
  authMiddleware,
  trainerMiddleware,
  addMemberToTrainer
);

// Assign member
router.post(
  "/members/:memberId/assign",
  authMiddleware,
  trainerMiddleware,
  assignMemberToTrainer
);

// Remove member
router.delete(
  "/members/:memberId",
  authMiddleware,
  trainerMiddleware,
  removeMemberFromTrainer
);

// Get member profile details
router.get(
  "/members/:memberId",
  authMiddleware,
  trainerMiddleware,
  getMemberProfile
);

// Attendance Management
import {
  getTrainerAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceController";

router.get(
  "/attendance",
  authMiddleware,
  trainerMiddleware,
  getTrainerAttendance
);

router.post(
  "/attendance",
  authMiddleware,
  trainerMiddleware,
  markAttendance
);

router.put(
  "/attendance/:id",
  authMiddleware,
  trainerMiddleware,
  updateAttendance
);

router.delete(
  "/attendance/:id",
  authMiddleware,
  trainerMiddleware,
  deleteAttendance
);

// Progress Tracking
import { getTrainerMemberProgress } from "../controllers/progressController";

router.get(
  "/members/:memberId/progress",
  authMiddleware,
  trainerMiddleware,
  getTrainerMemberProgress
);

export default router;