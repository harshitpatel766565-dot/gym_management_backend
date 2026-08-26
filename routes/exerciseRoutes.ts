import { Router } from "express";
import {
  getExercises,
  getExerciseById,
  createExercise,
  deleteExercise,
} from "../controllers/exerciseController";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";

const router = Router();

// Routes for exercises
router.get("/", getExercises);
router.get("/:id", getExerciseById);

// Admin only routes for mutating exercises
router.post("/", authMiddleware, adminMiddleware, createExercise);
router.delete("/:id", authMiddleware, adminMiddleware, deleteExercise);

export default router;
