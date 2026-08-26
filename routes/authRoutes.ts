import { Router } from "express";

import {
  register,
  login,
  createTrainer,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  getProfile,
  makeAdmin,
} from "../controllers/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.get("/make-admin", makeAdmin);

router.post("/register", register);

router.post("/login", login);

router.post("/create-trainer", createTrainer);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/verify-reset-otp",
  verifyResetOtp
);

router.post(
  "/reset-password",
  resetPassword
);

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

export default router;