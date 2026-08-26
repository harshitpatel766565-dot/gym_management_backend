import mongoose from "mongoose";
import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import Workout from "../models/Workout";
import { getParam } from "../utils/param";

// ==========================================
// CREATE WORKOUT
// ==========================================

export const createWorkout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    const {
      memberId,
      name,
      goal,
      exercises,
      startDate,
      endDate,
    } = req.body;

    if (!memberId || !name || !exercises) {
      res.status(400).json({
        success: false,
        message: "Member, workout name and exercises are required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      res.status(400).json({
        success: false,
        message: "Invalid member ID",
      });
      return;
    }

    // Check that member belongs to logged-in trainer
    const member = await User.findOne({
      _id: memberId,
      role: "user",
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!member) {
      res.status(403).json({
        success: false,
        message: "This member is not assigned to you",
      });
      return;
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one exercise is required",
      });
      return;
    }

    const workout = await Workout.create({
      trainer: new mongoose.Types.ObjectId(trainerId),
      member: new mongoose.Types.ObjectId(memberId),
      name,
      goal,
      exercises,
      startDate,
      endDate,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Workout created successfully",
      data: workout,
    });
  } catch (error) {
    console.error("Create workout error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create workout",
    });
  }
};

// ==========================================
// GET MY WORKOUTS
// ==========================================

export const getMyWorkouts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    const workouts = await Workout.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
    })
      .populate("member", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Workouts fetched successfully",
      data: workouts,
    });
  } catch (error) {
    console.error("Get workouts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch workouts",
    });
  }
};

// ==========================================
// GET WORKOUTS FOR ONE MEMBER
// ==========================================

export const getMemberWorkouts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const memberId = getParam(req.params, "memberId");

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      res.status(400).json({
        success: false,
        message: "Invalid member ID",
      });
      return;
    }

    const member = await User.findOne({
      _id: memberId,
      role: "user",
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!member) {
      res.status(403).json({
        success: false,
        message: "This member is not assigned to you",
      });
      return;
    }

    const workouts = await Workout.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
      member: new mongoose.Types.ObjectId(memberId),
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Member workouts fetched successfully",
      data: workouts,
    });
  } catch (error) {
    console.error("Get member workouts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch member workouts",
    });
  }
};

// ==========================================
// UPDATE WORKOUT
// ==========================================

export const updateWorkout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const workoutId = getParam(req.params, "workoutId");

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    if (!workoutId || !mongoose.Types.ObjectId.isValid(workoutId)) {
      res.status(400).json({
        success: false,
        message: "Invalid workout ID",
      });
      return;
    }

    const workout = await Workout.findOne({
      _id: workoutId,
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!workout) {
      res.status(404).json({
        success: false,
        message: "Workout not found",
      });
      return;
    }

    const allowedFields = [
      "name",
      "goal",
      "exercises",
      "status",
      "startDate",
      "endDate",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (workout as any)[field] = req.body[field];
      }
    }

    await workout.save();

    res.status(200).json({
      success: true,
      message: "Workout updated successfully",
      data: workout,
    });
  } catch (error) {
    console.error("Update workout error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update workout",
    });
  }
};

// ==========================================
// DELETE WORKOUT
// ==========================================

export const deleteWorkout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const workoutId = getParam(req.params, "workoutId");

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    if (!workoutId || !mongoose.Types.ObjectId.isValid(workoutId)) {
      res.status(400).json({
        success: false,
        message: "Invalid workout ID",
      });
      return;
    }

    const workout = await Workout.findOneAndDelete({
      _id: workoutId,
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!workout) {
      res.status(404).json({
        success: false,
        message: "Workout not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Workout deleted successfully",
    });
  } catch (error) {
    console.error("Delete workout error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete workout",
    });
  }
};