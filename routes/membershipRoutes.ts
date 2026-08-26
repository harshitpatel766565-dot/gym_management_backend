import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import {
  getPlans,
  getUserMembership,
  activateMembership,
  createPlan,
  updatePlan,
  deletePlan,
} from "../controllers/membershipController";

const router = Router();

// Publicly listing plans
router.get("/plans", getPlans);

// Protected active user membership checks
router.get("/user/:userId", authMiddleware, getUserMembership);

// Activating plan subscription
router.post("/activate", authMiddleware, activateMembership);

// Admin-only membership plan management
router.post("/plans", authMiddleware, adminMiddleware, createPlan);
router.put("/plans/:id", authMiddleware, adminMiddleware, updatePlan);
router.delete("/plans/:id", authMiddleware, adminMiddleware, deletePlan);

export default router;
