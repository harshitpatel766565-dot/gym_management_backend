import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import Progress from "../models/Progress";
import User from "../models/User";

// ==========================================
// GET MEMBER PROGRESS LOGS
// ==========================================
export const getProgressLogs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const logs = await Progress.find({
      member: new mongoose.Types.ObjectId(userId),
    }).sort({ date: 1 });

    // Format logs to match frontend interface: Map weight/bodyFatPercentage, etc.
    const formatted = logs.map(l => ({
      id: l._id.toString(),
      userId: l.member.toString(),
      date: l.date.toISOString().split("T")[0],
      weight: l.weight,
      bodyFatPercentage: l.bodyFatPercentage,
      chest: l.chest,
      waist: l.waist,
      arms: l.arms,
      legs: l.legs,
      workoutDurationMinutes: l.workoutDurationMinutes,
      caloriesBurned: l.caloriesBurned,
      notes: l.notes || "",
    }));

    res.status(200).json({
      success: true,
      message: "Progress logs fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Get progress logs error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch progress logs" });
  }
};

// ==========================================
// ADD PROGRESS LOG
// ==========================================
export const addProgressLog = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const {
      weight,
      bodyFatPercentage,
      chest,
      waist,
      arms,
      legs,
      workoutDurationMinutes,
      caloriesBurned,
      notes,
      date,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    if (weight === undefined || workoutDurationMinutes === undefined || caloriesBurned === undefined) {
      res.status(400).json({
        success: false,
        message: "Weight, workout duration, and calories burned are required",
      });
      return;
    }

    const member = await User.findById(userId);
    if (!member) {
      res.status(404).json({ success: false, message: "Member not found" });
      return;
    }

    const log = await Progress.create({
      member: member._id,
      trainer: member.trainer || member._id, // fallback to self if no trainer
      weight,
      bodyFatPercentage,
      chest,
      waist,
      arms,
      legs,
      workoutDurationMinutes,
      caloriesBurned,
      notes,
      date: date ? new Date(date) : new Date(),
    });

    // Update user's current weight, bmi, bodyFatPercentage in user profile
    if (!member.profile) {
      member.profile = {};
    }
    member.profile.weight = weight;
    if (bodyFatPercentage !== undefined) member.profile.bodyFatPercentage = bodyFatPercentage;
    
    // Auto-calculate BMI if height is available
    if (member.profile.height) {
      const heightInMeters = member.profile.height / 100;
      member.profile.bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    await member.save();

    const formatted = {
      id: log._id.toString(),
      userId: log.member.toString(),
      date: log.date.toISOString().split("T")[0],
      weight: log.weight,
      bodyFatPercentage: log.bodyFatPercentage,
      chest: log.chest,
      waist: log.waist,
      arms: log.arms,
      legs: log.legs,
      workoutDurationMinutes: log.workoutDurationMinutes,
      caloriesBurned: log.caloriesBurned,
      notes: log.notes || "",
    };

    res.status(201).json({
      success: true,
      message: "Progress logged successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Add progress log error:", error);
    res.status(500).json({ success: false, message: "Failed to add progress log" });
  }
};

// ==========================================
// TRAINER: GET MEMBER PROGRESS
// ==========================================
export const getTrainerMemberProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const { memberId } = req.params;

    if (!trainerId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      res.status(400).json({ success: false, message: "Invalid member ID" });
      return;
    }

    // Verify member is assigned to this trainer
    const member = await User.findOne({
      _id: memberId,
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!member) {
      res.status(403).json({ success: false, message: "Access denied. Member not assigned to you." });
      return;
    }

    const logs = await Progress.find({
      member: new mongoose.Types.ObjectId(memberId),
    }).sort({ date: 1 });

    const formatted = logs.map(l => ({
      id: l._id.toString(),
      userId: l.member.toString(),
      date: l.date.toISOString().split("T")[0],
      weight: l.weight,
      bodyFatPercentage: l.bodyFatPercentage,
      chest: l.chest,
      waist: l.waist,
      arms: l.arms,
      legs: l.legs,
      workoutDurationMinutes: l.workoutDurationMinutes,
      caloriesBurned: l.caloriesBurned,
      notes: l.notes || "",
    }));

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Trainer get member progress error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch member progress" });
  }
};
