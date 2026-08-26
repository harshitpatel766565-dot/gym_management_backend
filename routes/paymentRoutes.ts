import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware";
import {
  createRazorpayOrder,
  verifyPayment,
  getUserTransactions,
} from "../controllers/paymentController";

const router = Router();

router.post("/create-order", authMiddleware, createRazorpayOrder);

router.post("/verify", authMiddleware, verifyPayment);

router.get("/user/:userId", authMiddleware, getUserTransactions);

export default router;
