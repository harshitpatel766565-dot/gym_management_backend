import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import Notification from "../models/Notification";

// ==========================================
// GET USER NOTIFICATIONS
// ==========================================
export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const list = await Notification.find({
      user: new mongoose.Types.ObjectId(userId),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: list,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// ==========================================
// MARK NOTIFICATION AS READ
// ==========================================
export const markAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: new mongoose.Types.ObjectId(userId) },
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

// ==========================================
// DELETE NOTIFICATION
// ==========================================
export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const notification = await Notification.findOneAndDelete({
      _id: id,
      user: new mongoose.Types.ObjectId(userId),
    });

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
};

// Helper utility to create notifications
export const createSystemNotification = async (
  userId: string | mongoose.Types.ObjectId,
  title: string,
  message: string,
  type: string = "general"
): Promise<void> => {
  try {
    await Notification.create({
      user: new mongoose.Types.ObjectId(userId.toString()),
      title,
      message,
      type,
      read: false,
    });
  } catch (err) {
    console.error("Failed to create system notification:", err);
  }
};
