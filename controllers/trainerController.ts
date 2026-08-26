import mongoose from "mongoose";
import { Response } from "express";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import Booking from "../models/Booking";
import Progress from "../models/Progress";
import Attendance from "../models/Attendance";
import { getParam } from "../utils/param";

// ==========================================
// TRAINER DASHBOARD
// ==========================================

export const getTrainerDashboard = async (
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

    const totalMembers = await User.countDocuments({
      trainer: new mongoose.Types.ObjectId(trainerId),
      role: "user",
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaySessions = await Booking.countDocuments({
      trainer: new mongoose.Types.ObjectId(trainerId),
      date: { $gte: startOfToday, $lte: endOfToday },
    });

    const pendingBookings = await Booking.countDocuments({
      trainer: new mongoose.Types.ObjectId(trainerId),
      status: "pending",
    });

    const todayAttendance = await Attendance.countDocuments({
      trainer: new mongoose.Types.ObjectId(trainerId),
      date: { $gte: startOfToday, $lte: endOfToday },
      status: { $in: ["present", "late"] },
    });

    const bookings = await Booking.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
      date: { $gte: startOfToday },
    })
      .populate("member", "name")
      .sort({ date: 1, startTime: 1 })
      .limit(5);

    const upcomingSessions = bookings.map((b) => ({
      id: b._id.toString(),
      memberName: (b.member as any)?.name || "Member",
      program: b.sessionType || b.title,
      time: b.startTime,
      status: b.status,
    }));

    // Fetch real progress logs from DB for this trainer
    const progressLogs = await Progress.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
    })
      .populate("member", "name")
      .sort({ date: -1 })
      .limit(5);

    const recentProgress = progressLogs.map(l => ({
      memberName: (l.member as any)?.name || "Athlete",
      metric: "Weight Logged",
      progress: `${l.weight} kg`,
      period: l.date.toISOString().split("T")[0],
    }));

    res.status(200).json({
      success: true,
      message: "Trainer dashboard data fetched successfully",
      data: {
        totalMembers,
        todaySessions,
        pendingBookings,
        todayAttendance: todayAttendance,
        upcomingSessions,
        recentProgress,
      },
    });
  } catch (error) {
    console.error("Trainer dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load trainer dashboard",
    });
  }
};

// ==========================================
// GET ASSIGNED MEMBERS
// ==========================================

export const getTrainerMembers = async (
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

    const members = await User.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
      role: "user",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Trainer members fetched successfully",
      data: members,
    });
  } catch (error) {
    console.error("Get trainer members error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trainer members",
    });
  }
};

// ==========================================
// GET AVAILABLE MEMBERS
// ==========================================

export const getAvailableMembers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    const members = await User.find({
      role: "user",
      $or: [
        { trainer: null },
        { trainer: { $exists: false } },
      ],
    })
      .select("-password")
      .sort({ createdAt: -1 });

    console.log("Available members:", members.length);

    res.status(200).json({
      success: true,
      message: "Available members fetched successfully",
      data: members,
    });
  } catch (error) {
    console.error("Get available members error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch available members",
    });
  }
};

// ==========================================
// ASSIGN MEMBER TO TRAINER
// ==========================================

export const assignMemberToTrainer = async (
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

    if (!memberId) {
      res.status(400).json({
        success: false,
        message: "Member ID is required",
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

    const member = await User.findOne({
      _id: memberId,
      role: "user",
    });

    if (!member) {
      res.status(404).json({
        success: false,
        message: "Member not found",
      });
      return;
    }

    if (member.trainer?.toString() === trainerId) {
      res.status(400).json({
        success: false,
        message: "This member is already assigned to you",
      });
      return;
    }

    if (member.trainer) {
      res.status(409).json({
        success: false,
        message: "This member is already assigned to another trainer",
      });
      return;
    }

    member.trainer = new mongoose.Types.ObjectId(trainerId);

    await member.save();

    res.status(200).json({
      success: true,
      message: "Member assigned successfully",
      data: {
        id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        trainer: member.trainer,
      },
    });
  } catch (error) {
    console.error("Assign member error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to assign member",
    });
  }
};

// ==========================================
// REMOVE MEMBER FROM TRAINER
// ==========================================

export const removeMemberFromTrainer = async (
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
      res.status(404).json({
        success: false,
        message: "Assigned member not found",
      });
      return;
    }

    member.trainer = null;

    await member.save();

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove member",
    });
  }
};
export const addMemberToTrainer = async (
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
      name,
      email,
      phone,
      password,
    } = req.body;

    if (!name || !email) {
      res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
      return;
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    // Check existing account
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          "A user with this email already exists",
      });
      return;
    }

    // Generate temporary password when not provided
    const rawPassword =
      password?.trim() ||
      `Gym@${Math.floor(
        100000 + Math.random() * 900000
      )}`;

    const hashedPassword =
      await bcrypt.hash(rawPassword, 10);

    const member = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || "",
      password: hashedPassword,
      role: "user",
      trainer: trainerId,
    });

    res.status(201).json({
      success: true,
      message: "Member created and assigned successfully",
      data: {
        member: {
          _id: member._id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.role,
          trainer: member.trainer,
          createdAt: member.createdAt,
        },
        temporaryPassword: rawPassword,
      },
    });
  } catch (error) {
    console.error(
      "Add member to trainer error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create member",
    });
  }
};

// ==========================================
// TRAINER: GET MEMBER DETAILS
// ==========================================
export const getMemberProfile = async (
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
    }).populate("trainer", "name email phone");

    if (!member) {
      res.status(404).json({
        success: false,
        message: "Member not found or not assigned to you",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Get member profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get member profile",
    });
  }
};