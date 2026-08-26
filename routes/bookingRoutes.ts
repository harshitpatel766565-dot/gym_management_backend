import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware";
import trainerMiddleware from "../middleware/trainerMiddleware";

import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
} from "../controllers/bookingController";

const router = Router();

// Create booking
router.post(
  "/",
  authMiddleware,
  trainerMiddleware,
  createBooking
);

// Get trainer bookings
router.get(
  "/",
  authMiddleware,
  trainerMiddleware,
  getMyBookings
);

// Update booking status
router.patch(
  "/:bookingId/status",
  authMiddleware,
  trainerMiddleware,
  updateBookingStatus
);

// Update booking
router.put(
  "/:bookingId",
  authMiddleware,
  trainerMiddleware,
  updateBooking
);

// Delete booking
router.delete(
  "/:bookingId",
  authMiddleware,
  trainerMiddleware,
  deleteBooking
);

export default router;