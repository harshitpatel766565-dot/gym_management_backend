import mongoose from "mongoose";
import { Response } from "express";

import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import Booking from "../models/Booking";

// ==========================================
// CREATE BOOKING
// ==========================================

export const createBooking = async (
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
      title,
      sessionType,
      date,
      startTime,
      endTime,
      notes,
    } = req.body;

    if (!memberId || !title || !date || !startTime) {
      res.status(400).json({
        success: false,
        message:
          "Member, title, date and start time are required",
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
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!member) {
      res.status(403).json({
        success: false,
        message: "This member is not assigned to you",
      });
      return;
    }

    const booking = await Booking.create({
      trainer: new mongoose.Types.ObjectId(trainerId),
      member: new mongoose.Types.ObjectId(memberId),
      title: title.trim(),
      sessionType:
        sessionType?.trim() || "Personal Training",
      date: new Date(date),
      startTime: startTime.trim(),
      endTime: endTime?.trim(),
      notes: notes?.trim(),
      status: "pending",
    });

    const populatedBooking = await Booking.findById(
      booking._id
    )
      .populate("member", "name email phone")
      .populate("trainer", "name email");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
};

// ==========================================
// GET MY BOOKINGS
// ==========================================

export const getMyBookings = async (
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

    const bookings = await Booking.find({
      trainer: new mongoose.Types.ObjectId(trainerId),
    })
      .populate("member", "name email phone")
      .sort({
        date: 1,
        startTime: 1,
      });

    res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// ==========================================
// UPDATE BOOKING STATUS
// ==========================================

export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    if (
      !bookingId ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
      return;
    }

    const allowedStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
      return;
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    booking.status = status;

    await booking.save();

    const updatedBooking = await Booking.findById(
      booking._id
    ).populate("member", "name email phone");

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error(
      "Update booking status error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

// ==========================================
// UPDATE BOOKING
// ==========================================

export const updateBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const { bookingId } = req.params;

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    if (
      !bookingId ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
      return;
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    const allowedFields = [
      "title",
      "sessionType",
      "date",
      "startTime",
      "endTime",
      "notes",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (booking as any)[field] = req.body[field];
      }
    }

    await booking.save();

    const updatedBooking = await Booking.findById(
      booking._id
    ).populate("member", "name email phone");

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update booking",
    });
  }
};

// ==========================================
// DELETE BOOKING
// ==========================================

export const deleteBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const trainerId = req.user?.id;
    const { bookingId } = req.params;

    if (!trainerId) {
      res.status(401).json({
        success: false,
        message: "Trainer authentication required",
      });
      return;
    }

    if (
      !bookingId ||
      !mongoose.Types.ObjectId.isValid(bookingId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
      return;
    }

    const booking = await Booking.findOneAndDelete({
      _id: bookingId,
      trainer: new mongoose.Types.ObjectId(trainerId),
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete booking",
    });
  }
};

// ==========================================
// MEMBER: GET OWN BOOKINGS
// ==========================================
export const getUserBookings = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const bookings = await Booking.find({
      member: new mongoose.Types.ObjectId(userId),
    })
      .populate("trainer", "name email phone")
      .sort({ date: -1 });

    // Format response matching frontend Booking model fields
    const formatted = bookings.map(b => ({
      id: b._id.toString(),
      userId: b.member.toString(),
      userName: "", // optional or fallback
      userEmail: "", // optional or fallback
      serviceType: b.sessionType || "Personal Training",
      trainerId: (b.trainer as any)?._id?.toString() || "",
      trainerName: (b.trainer as any)?.name || "Master Coach",
      date: b.date.toISOString().split("T")[0],
      timeSlot: b.startTime,
      status: b.status,
      notes: b.notes || "",
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

    res.status(200).json({
      success: true,
      message: "User bookings fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user bookings" });
  }
};

// ==========================================
// MEMBER: CREATE BOOKING
// ==========================================
export const createMemberBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, trainerId, serviceType, date, timeSlot, notes } = req.body;

    if (!userId || !trainerId || !date || !timeSlot) {
      res.status(400).json({ success: false, message: "Required booking fields are missing" });
      return;
    }

    // Check double booking
    const conflicting = await Booking.findOne({
      trainer: new mongoose.Types.ObjectId(trainerId),
      date: new Date(date),
      startTime: timeSlot,
      status: { $ne: "cancelled" },
    });

    if (conflicting) {
      res.status(409).json({
        success: false,
        message: "This slot is already booked for this trainer. Please select another slot.",
      });
      return;
    }

    // Check if user already has booking
    const conflictingUser = await Booking.findOne({
      member: new mongoose.Types.ObjectId(userId),
      date: new Date(date),
      startTime: timeSlot,
      status: { $ne: "cancelled" },
    });

    if (conflictingUser) {
      res.status(409).json({
        success: false,
        message: "You already have another session booked at this exact time slot.",
      });
      return;
    }

    const booking = await Booking.create({
      member: new mongoose.Types.ObjectId(userId),
      trainer: new mongoose.Types.ObjectId(trainerId),
      title: serviceType || "Personal Training",
      sessionType: serviceType || "Personal Training",
      date: new Date(date),
      startTime: timeSlot,
      notes,
      status: "confirmed",
    });

    const populated = await Booking.findById(booking._id).populate("trainer", "name");

    const formatted = {
      id: booking._id.toString(),
      userId: booking.member.toString(),
      serviceType: booking.sessionType,
      trainerId: booking.trainer.toString(),
      trainerName: (populated?.trainer as any)?.name || "Master Coach",
      date: booking.date.toISOString().split("T")[0],
      timeSlot: booking.startTime,
      status: booking.status,
      notes: booking.notes || "",
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };

    res.status(201).json({
      success: true,
      message: "Session booked successfully! Confirmation sent to your email.",
      data: formatted,
    });
  } catch (error) {
    console.error("Create member booking error:", error);
    res.status(500).json({ success: false, message: "Failed to book session" });
  }
};

// ==========================================
// MEMBER: CANCEL BOOKING
// ==========================================
export const cancelMemberBooking = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ success: false, message: "Invalid booking ID" });
      return;
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking has been cancelled.",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel member booking error:", error);
    res.status(500).json({ success: false, message: "Failed to cancel booking" });
  }
};