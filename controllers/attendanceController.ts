import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import Attendance from "../models/Attendance";
import User from "../models/User";
import Booking from "../models/Booking";

// ==========================================
// GET MONTHLY SUMMARY (FOR MEMBER DASHBOARD)
// ==========================================
export const getMonthlySummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || (new Date().getMonth() + 1);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const records = await Attendance.find({
      member: new mongoose.Types.ObjectId(userId),
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const totalDays = 31; // For presentation consistency in the frontend calendar
    const presentCount = records.filter(r => r.status === "present" || r.status === "late").length;
    const attendancePercentage = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

    // Calculate streaks
    let currentStreakDays = 0;
    let longestStreakDays = 0;
    let tempStreak = 0;

    // We can fetch all present check-ins sorted to calculate streaks
    const allPresents = await Attendance.find({
      member: new mongoose.Types.ObjectId(userId),
      status: { $in: ["present", "late"] }
    }).sort({ date: 1 });

    if (allPresents.length > 0) {
      tempStreak = 1;
      longestStreakDays = 1;
      for (let i = 1; i < allPresents.length; i++) {
        const prev = new Date(allPresents[i - 1].date);
        const curr = new Date(allPresents[i].date);
        const diffTime = Math.abs(curr.getTime() - prev.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > longestStreakDays) {
            longestStreakDays = tempStreak;
          }
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreakDays) {
        longestStreakDays = tempStreak;
      }
      
      // Calculate current streak (ends today or yesterday)
      const lastCheckIn = new Date(allPresents[allPresents.length - 1].date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastCheckInDay = new Date(lastCheckIn);
      lastCheckInDay.setHours(0, 0, 0, 0);
      
      const diffFromToday = Math.ceil(Math.abs(today.getTime() - lastCheckInDay.getTime()) / (1000 * 60 * 60 * 24));
      if (diffFromToday <= 1) {
        currentStreakDays = tempStreak;
      } else {
        currentStreakDays = 0;
      }
    }

    // Format records for frontend
    const formattedRecords = records.map(r => ({
      id: r._id.toString(),
      date: r.date.toISOString().split("T")[0],
      status: r.status,
      checkInTime: r.checkInTime || "",
      checkOutTime: r.checkOutTime || "",
      notes: r.notes || "",
    }));

    res.status(200).json({
      success: true,
      message: "Attendance monthly summary loaded",
      data: {
        presentCount,
        totalDays: records.length || 0,
        attendancePercentage,
        currentStreakDays,
        longestStreakDays,
        records: formattedRecords,
      }
    });
  } catch (error) {
    console.error("Get monthly summary error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch attendance logs" });
  }
};

// ==========================================
// MEMBER INSTANT CHECK-IN (POST /attendance/checkin)
// ==========================================
export const checkInToday = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, userName } = req.body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if already checked in
    const existing = await Attendance.findOne({
      member: new mongoose.Types.ObjectId(userId),
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (existing) {
      res.status(400).json({ success: false, message: "Already checked in for today." });
      return;
    }

    // Find member to get their trainer ID
    const member = await User.findById(userId);
    if (!member) {
      res.status(404).json({ success: false, message: "Member not found" });
      return;
    }

    const trainerId = member.trainer || null;
    if (!trainerId) {
      // Find any default trainer or handle no trainer case
      // For now, let's look for any trainer or assign to a dummy trainer ID if null
      // Actually, we can check if trainer exists
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour12: true, hour: '2-digit', minute: '2-digit' });

    const attendance = await Attendance.create({
      member: member._id,
      trainer: trainerId || member._id, // fallback to self if no trainer assigned
      date: new Date(),
      checkInTime: timeStr,
      status: "present",
      notes: "Instant QR Check-In",
    });

    res.status(201).json({
      success: true,
      message: `Checked in successfully at ${timeStr}! Keep up the momentum.`,
      data: attendance,
    });
  } catch (error) {
    console.error("Instant checkin error:", error);
    res.status(500).json({ success: false, message: "Failed to record check-in" });
  }
};

// ==========================================
// TRAINER: GET ATTENDANCE OF ASSIGNED MEMBERS
// ==========================================
export const getTrainerAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;

    if (!trainerId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const records = await Attendance.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
    })
      .populate("member", "name email phone")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Trainer attendance logs fetched",
      data: records,
    });
  } catch (error) {
    console.error("Trainer get attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch attendance" });
  }
};

// ==========================================
// TRAINER: MARK/CREATE ATTENDANCE RECORD
// ==========================================
export const markAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const { memberId, bookingId, date, status, checkInTime, checkOutTime, notes } = req.body;

    if (!trainerId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!memberId || !status || !date) {
      res.status(400).json({ success: false, message: "Member, status and date are required" });
      return;
    }

    // Verify member is assigned to this trainer
    const member = await User.findOne({
      _id: memberId,
      role: "user",
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!member) {
      res.status(403).json({ success: false, message: "This member is not assigned to you" });
      return;
    }

    const attendance = await Attendance.create({
      member: new mongoose.Types.ObjectId(memberId),
      trainer: new mongoose.Types.ObjectId(trainerId),
      booking: bookingId ? new mongoose.Types.ObjectId(bookingId) : null,
      date: new Date(date),
      status,
      checkInTime,
      checkOutTime,
      notes,
    });

    const populated = await Attendance.findById(attendance._id).populate("member", "name email phone");

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to mark attendance" });
  }
};

// ==========================================
// TRAINER: EDIT ATTENDANCE RECORD
// ==========================================
export const updateAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const { id } = req.params;
    const { status, checkInTime, checkOutTime, notes, date } = req.body;

    if (!trainerId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const record = await Attendance.findOne({
      _id: id,
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!record) {
      res.status(404).json({ success: false, message: "Attendance record not found" });
      return;
    }

    if (status !== undefined) record.status = status;
    if (checkInTime !== undefined) record.checkInTime = checkInTime;
    if (checkOutTime !== undefined) record.checkOutTime = checkOutTime;
    if (notes !== undefined) record.notes = notes;
    if (date !== undefined) record.date = new Date(date);

    await record.save();

    const populated = await Attendance.findById(record._id).populate("member", "name email phone");

    res.status(200).json({
      success: true,
      message: "Attendance record updated",
      data: populated,
    });
  } catch (error) {
    console.error("Update attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to update attendance" });
  }
};

// ==========================================
// TRAINER: DELETE ATTENDANCE RECORD
// ==========================================
export const deleteAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const { id } = req.params;

    if (!trainerId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const record = await Attendance.findOneAndDelete({
      _id: id,
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!record) {
      res.status(404).json({ success: false, message: "Attendance record not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({ success: false, message: "Failed to delete attendance" });
  }
};
