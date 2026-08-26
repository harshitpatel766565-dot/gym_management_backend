import { Router } from "express";
import {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController";

const router = Router();

// Public routes
router.get("/", getPrograms);
router.get("/:id", getProgramById);

// Admin/Trainer routes (can be secured with authMiddleware if needed)
router.post("/", createProgram);
router.put("/:id", updateProgram);
router.delete("/:id", deleteProgram);

export default router;
