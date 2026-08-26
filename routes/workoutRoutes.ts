import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware";
import trainerMiddleware from "../middleware/trainerMiddleware";

import {
  createWorkout,
  getMyWorkouts,
  getMemberWorkouts,
  updateWorkout,
  deleteWorkout,
} from "../controllers/workoutController";

const router = Router();

router.post(
  "/",
  authMiddleware,
  trainerMiddleware,
  createWorkout
);

router.get(
  "/",
  authMiddleware,
  trainerMiddleware,
  getMyWorkouts
);

router.get(
  "/member/:memberId",
  authMiddleware,
  trainerMiddleware,
  getMemberWorkouts
);

router.put(
  "/:workoutId",
  authMiddleware,
  trainerMiddleware,
  updateWorkout
);

router.delete(
  "/:workoutId",
  authMiddleware,
  trainerMiddleware,
  deleteWorkout
);

export default router;
