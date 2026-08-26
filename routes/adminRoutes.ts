import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import {
  getAnalyticsSummary,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getTrainers,
  getAllBookings,
  updateBookingStatusAdmin,
  getAllPayments,
  getAllAttendance,
} from "../controllers/adminController";

const router = Router();

// Protect all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard Analytics
router.get("/analytics", getAnalyticsSummary);

// User CRUD
router.get("/users", getUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Trainer Listing
router.get("/trainers", getTrainers);
router.post("/trainers", createUser); // reuse createUser to add a trainer with role: "trainer"

// Bookings
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatusAdmin);

// Payments & Attendance
router.get("/payments", getAllPayments);
router.get("/attendance", getAllAttendance);

export default router;
