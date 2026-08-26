import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController";

const router = Router();

router.get("/", authMiddleware, getNotifications);
router.patch("/:id/read", authMiddleware, markAsRead);
router.delete("/:id", authMiddleware, deleteNotification);

export default router;
