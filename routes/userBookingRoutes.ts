import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  getUserBookings,
  createMemberBooking,
  cancelMemberBooking,
} from "../controllers/bookingController";

const router = Router();

router.get("/user/:userId", authMiddleware, getUserBookings);
router.post("/", authMiddleware, createMemberBooking);
router.post("/:bookingId/cancel", authMiddleware, cancelMemberBooking);

export default router;
