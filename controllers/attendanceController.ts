import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import Attendance from "../models/Attendance";
import User from "../models/User";

// ==========================================
// GET MONTHLY SUMMARY (FOR MEMBER DASHBOARD)
// ==========================================
export const getMonthlySummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = String(req.params.userId);

    const year =
      parseInt(req.query.year as string) ||
      new Date().getFullYear();

    const month =
      parseInt(req.query.month as string) ||
      new Date().getMonth() + 1;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(
      year,
      month,
      0,
      23,
      59,
      59,
      999
    );

    const records = await Attendance.find({
      member: new mongoose.Types.ObjectId(userId),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    const presentCount = records.filter(
      (r) =>
        r.status === "present" ||
        r.status === "late"
    ).length;

    const attendancePercentage =
      records.length > 0
        ? Math.round(
            (presentCount / records.length) * 100
          )
        : 0;

    // ==========================================
    // CALCULATE STREAKS
    // ==========================================

    let currentStreakDays = 0;
    let longestStreakDays = 0;
    let tempStreak = 0;

    const allPresents = await Attendance.find({
      member: new mongoose.Types.ObjectId(userId),
      status: {
        $in: ["present", "late"],
      },
    }).sort({ date: 1 });

    if (allPresents.length > 0) {
      tempStreak = 1;
      longestStreakDays = 1;

      for (
        let i = 1;
        i < allPresents.length;
        i++
      ) {
        const prev = new Date(
          allPresents[i - 1].date
        );

        const curr = new Date(
          allPresents[i].date
        );

        const diffTime = Math.abs(
          curr.getTime() - prev.getTime()
        );

        const diffDays = Math.ceil(
          diffTime /
            (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (
            tempStreak >
            longestStreakDays
          ) {
            longestStreakDays =
              tempStreak;
          }

          tempStreak = 1;
        }
      }

      if (
        tempStreak >
        longestStreakDays
      ) {
        longestStreakDays =
          tempStreak;
      }

      // ==========================================
      // CURRENT STREAK
      // ==========================================

      const lastCheckIn = new Date(
        allPresents[
          allPresents.length - 1
        ].date
      );

      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const lastCheckInDay =
        new Date(lastCheckIn);

      lastCheckInDay.setHours(
        0,
        0,
        0,
        0
      );

      const diffFromToday = Math.ceil(
        Math.abs(
          today.getTime() -
            lastCheckInDay.getTime()
        ) /
          (1000 * 60 * 60 * 24)
      );

      if (diffFromToday <= 1) {
        currentStreakDays =
          tempStreak;
      } else {
        currentStreakDays = 0;
      }
    }

    // ==========================================
    // FORMAT RECORDS
    // ==========================================

    const formattedRecords =
      records.map((r) => ({
        id: r._id.toString(),

        date: r.date
          .toISOString()
          .split("T")[0],

        status: r.status,

        checkInTime:
          r.checkInTime || "",

        checkOutTime:
          r.checkOutTime || "",

        notes: r.notes || "",
      }));

    res.status(200).json({
      success: true,

      message:
        "Attendance monthly summary loaded",

      data: {
        presentCount,

        totalDays:
          records.length || 0,

        attendancePercentage,

        currentStreakDays,

        longestStreakDays,

        records: formattedRecords,
      },
    });
  } catch (error) {
    console.error(
      "Get monthly summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch attendance logs",
    });
  }
};

// ==========================================
// MEMBER INSTANT CHECK-IN
// POST /attendance/checkin
// ==========================================
export const checkInToday = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, userName } =
      req.body;

    const userIdString =
      String(userId || "");

    if (
      !userIdString ||
      !mongoose.Types.ObjectId.isValid(
        userIdString
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
      return;
    }

    const todayStart = new Date();

    todayStart.setHours(
      0,
      0,
      0,
      0
    );

    const todayEnd = new Date();

    todayEnd.setHours(
      23,
      59,
      59,
      999
    );

    // ==========================================
    // CHECK ALREADY CHECKED IN
    // ==========================================

    const existing =
      await Attendance.findOne({
        member:
          new mongoose.Types.ObjectId(
            userIdString
          ),

        date: {
          $gte: todayStart,
          $lte: todayEnd,
        },
      });

    if (existing) {
      res.status(400).json({
        success: false,
        message:
          "Already checked in for today.",
      });

      return;
    }

    // ==========================================
    // FIND MEMBER
    // ==========================================

    const member =
      await User.findById(
        userIdString
      );

    if (!member) {
      res.status(404).json({
        success: false,
        message: "Member not found",
      });

      return;
    }

    const trainerId =
      member.trainer || null;

    const now = new Date();

    const timeStr =
      now.toLocaleTimeString(
        "en-US",
        {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    // ==========================================
    // CREATE ATTENDANCE
    // ==========================================

    const attendance =
      await Attendance.create({
        member: member._id,

        trainer:
          trainerId || member._id,

        date: new Date(),

        checkInTime: timeStr,

        status: "present",

        notes:
          "Instant QR Check-In",
      });

    res.status(201).json({
      success: true,

      message: `Checked in successfully at ${timeStr}! Keep up the momentum.`,

      data: attendance,
    });
  } catch (error) {
    console.error(
      "Instant checkin error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to record check-in",
    });
  }
};

// ==========================================
// TRAINER: GET ATTENDANCE
// ==========================================
export const getTrainerAttendance =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const trainerId =
        req.user?.id;

      if (!trainerId) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });

        return;
      }

      const trainerIdString =
        String(trainerId);

      if (
        !mongoose.Types.ObjectId.isValid(
          trainerIdString
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid trainer ID",
        });

        return;
      }

      const records =
        await Attendance.find({
          trainer:
            new mongoose.Types.ObjectId(
              trainerIdString
            ),
        })
          .populate(
            "member",
            "name email phone"
          )
          .sort({ date: -1 });

      res.status(200).json({
        success: true,

        message:
          "Trainer attendance logs fetched",

        data: records,
      });
    } catch (error) {
      console.error(
        "Trainer get attendance error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch attendance",
      });
    }
  };

// ==========================================
// TRAINER: MARK/CREATE ATTENDANCE
// ==========================================
export const markAttendance = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId =
      req.user?.id;

    const {
      memberId,
      bookingId,
      date,
      status,
      checkInTime,
      checkOutTime,
      notes,
    } = req.body;

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });

      return;
    }

    if (
      !memberId ||
      !status ||
      !date
    ) {
      res.status(400).json({
        success: false,
        message:
          "Member, status and date are required",
      });

      return;
    }

    const trainerIdString =
      String(trainerId);

    const memberIdString =
      String(memberId);

    if (
      !mongoose.Types.ObjectId.isValid(
        trainerIdString
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid trainer ID",
      });

      return;
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        memberIdString
      )
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid member ID",
      });

      return;
    }

    // ==========================================
    // VERIFY MEMBER
    // ==========================================

    const member =
      await User.findOne({
        _id:
          new mongoose.Types.ObjectId(
            memberIdString
          ),

        role: "user",

        trainer:
          new mongoose.Types.ObjectId(
            trainerIdString
          ),
      });

    if (!member) {
      res.status(403).json({
        success: false,
        message:
          "This member is not assigned to you",
      });

      return;
    }

    // ==========================================
    // BOOKING ID
    // ==========================================

    let bookingObjectId:
      | mongoose.Types.ObjectId
      | null = null;

    if (bookingId) {
      const bookingIdString =
        String(bookingId);

      if (
        !mongoose.Types.ObjectId.isValid(
          bookingIdString
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid booking ID",
        });

        return;
      }

      bookingObjectId =
        new mongoose.Types.ObjectId(
          bookingIdString
        );
    }

    // ==========================================
    // CREATE ATTENDANCE
    // ==========================================

    const attendance =
      await Attendance.create({
        member:
          new mongoose.Types.ObjectId(
            memberIdString
          ),

        trainer:
          new mongoose.Types.ObjectId(
            trainerIdString
          ),

        booking: bookingObjectId,

        date: new Date(date),

        status,

        checkInTime,

        checkOutTime,

        notes,
      });

    const populated =
      await Attendance.findById(
        attendance._id
      ).populate(
        "member",
        "name email phone"
      );

    res.status(201).json({
      success: true,

      message:
        "Attendance marked successfully",

      data: populated,
    });
  } catch (error) {
    console.error(
      "Mark attendance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to mark attendance",
    });
  }
};

// ==========================================
// TRAINER: EDIT ATTENDANCE
// ==========================================
export const updateAttendance =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const trainerId =
        req.user?.id;

      const id =
        String(req.params.id);

      const {
        status,
        checkInTime,
        checkOutTime,
        notes,
        date,
      } = req.body;

      if (!trainerId) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });

        return;
      }

      const trainerIdString =
        String(trainerId);

      if (
        !mongoose.Types.ObjectId.isValid(
          trainerIdString
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid trainer ID",
        });

        return;
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid attendance ID",
        });

        return;
      }

      const record =
        await Attendance.findOne({
          _id:
            new mongoose.Types.ObjectId(
              id
            ),

          trainer:
            new mongoose.Types.ObjectId(
              trainerIdString
            ),
        });

      if (!record) {
        res.status(404).json({
          success: false,
          message:
            "Attendance record not found",
        });

        return;
      }

      if (
        status !== undefined
      ) {
        record.status = status;
      }

      if (
        checkInTime !== undefined
      ) {
        record.checkInTime =
          checkInTime;
      }

      if (
        checkOutTime !== undefined
      ) {
        record.checkOutTime =
          checkOutTime;
      }

      if (
        notes !== undefined
      ) {
        record.notes = notes;
      }

      if (date !== undefined) {
        record.date =
          new Date(date);
      }

      await record.save();

      const populated =
        await Attendance.findById(
          record._id
        ).populate(
          "member",
          "name email phone"
        );

      res.status(200).json({
        success: true,

        message:
          "Attendance record updated",

        data: populated,
      });
    } catch (error) {
      console.error(
        "Update attendance error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update attendance",
      });
    }
  };

// ==========================================
// TRAINER: DELETE ATTENDANCE
// ==========================================
export const deleteAttendance =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const trainerId =
        req.user?.id;

      const id =
        String(req.params.id);

      if (!trainerId) {
        res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });

        return;
      }

      const trainerIdString =
        String(trainerId);

      if (
        !mongoose.Types.ObjectId.isValid(
          trainerIdString
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid trainer ID",
        });

        return;
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        res.status(400).json({
          success: false,
          message:
            "Invalid attendance ID",
        });

        return;
      }

      const record =
        await Attendance.findOneAndDelete({
          _id:
            new mongoose.Types.ObjectId(
              id
            ),

          trainer:
            new mongoose.Types.ObjectId(
              trainerIdString
            ),
        });

      if (!record) {
        res.status(404).json({
          success: false,
          message:
            "Attendance record not found",
        });

        return;
      }

      res.status(200).json({
        success: true,

        message:
          "Attendance record deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete attendance error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete attendance",
      });
    }
  };