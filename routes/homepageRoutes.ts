import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import {
  getHomepageContent,
  updateHomepageContent,
} from "../controllers/homepageController";

const router = Router();

// Publicly accessible to fetch content
router.get("/", getHomepageContent);

// Restricted to admin to update content
router.put("/", authMiddleware, adminMiddleware, updateHomepageContent);

export default router;
