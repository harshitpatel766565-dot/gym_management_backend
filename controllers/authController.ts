import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User";
import PasswordReset from "../models/PasswordReset";

import { sendPasswordResetOtp } from "../services/emailService";

// ==========================================
// REGISTER MEMBER
// ==========================================

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: "user",
      trainer: null,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
          createdAt: user.createdAt?.toISOString() || "",
          updatedAt: user.updatedAt?.toISOString() || "",
          isActive: true,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        message: "JWT_SECRET is missing",
      });
      return;
    }

    const accessToken = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
      },
      secret,
      {
        expiresIn: "7d",
      }
    );

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      createdAt: user.createdAt?.toISOString() || "",
      updatedAt: user.updatedAt?.toISOString() || "",
      isActive: true,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        tokens: {
          access: accessToken,
          refresh: accessToken,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// CREATE TRAINER
// ==========================================

export const createTrainer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: "trainer",
      trainer: null,
    });

    res.status(201).json({
      success: true,
      message: "Trainer account created successfully",
      user: {
        id: trainer._id.toString(),
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone || "",
        role: trainer.role,
      },
    });
  } catch (error) {
    console.error("Create trainer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create trainer",
    });
  }
};

// ==========================================
// FORGOT PASSWORD - SEND OTP
// ==========================================

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
      return;
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await PasswordReset.deleteMany({
      email: normalizedEmail,
    });

    await PasswordReset.create({
      email: normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      verified: false,
    });

    await sendPasswordResetOtp(
      normalizedEmail,
      otp
    );

    res.status(200).json({
      success: true,
      message:
        "Password reset OTP has been sent to your email",
      data: {
        sent: true,
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send password reset OTP",
    });
  }
};

// ==========================================
// VERIFY RESET OTP
// ==========================================

export const verifyResetOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const reset = await PasswordReset.findOne({
      email: normalizedEmail,
      otp: otp.toString(),
      expiresAt: {
        $gt: new Date(),
      },
      verified: false,
    });

    if (!reset) {
      res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
      return;
    }

    reset.verified = true;
    await reset.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, newPassword } = req.body;

    console.log("RESET PASSWORD REQUEST:", {
      email,
      hasPassword: !!newPassword,
    });

    if (!email || !newPassword) {
      res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const reset = await PasswordReset.findOne({
      email: normalizedEmail,
      verified: true,
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!reset) {
      res.status(400).json({
        success: false,
        message:
          "Please verify OTP before resetting password",
      });
      return;
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    // Verify hash actually matches the new password
    const passwordMatches = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (!passwordMatches) {
      res.status(500).json({
        success: false,
        message: "Password update verification failed",
      });
      return;
    }

    await PasswordReset.deleteMany({
      email: normalizedEmail,
    });

    console.log(
      `Password reset successful for ${normalizedEmail}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};

// ==========================================
// GET USER PROFILE
// ==========================================

import { AuthRequest } from "../middleware/authMiddleware";

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await User.findById(userId).select("-password").populate("trainer", "name email");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Map _id to id to match frontend expectation
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      profile: user.profile,
      trainer: user.trainer,
      createdAt: user.createdAt?.toISOString() || "",
      updatedAt: user.updatedAt?.toISOString() || "",
      isActive: true,
    };

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

// ==========================================
// DEVELOPER UTILITY: AUTO-CREATE/PROMOTE ADMIN
// ==========================================
export const makeAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.query;
    const adminEmail = (email as string || "admin@ironforge.com").toLowerCase().trim();

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      user.role = "admin";
      user.isActive = true;
      await user.save();
    } else {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      user = await User.create({
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isActive: true,
      });
    }

    res.status(200).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #0c0c0e; color: #fff; min-height: 100vh;">
        <h1 style="color: #ff4500; font-size: 32px;">🔥 IRONFORGE ADMIN INSTALLED 🔥</h1>
        <p style="font-size: 18px; margin: 20px 0;">Admin account is active in MongoDB database!</p>
        <div style="background: #18181d; padding: 20px; border-radius: 15px; display: inline-block; text-align: left; border: 1px solid #27272e;">
          <p>📧 <strong>Email:</strong> ${adminEmail}</p>
          <p>🔑 <strong>Password:</strong> admin123</p>
        </div>
        <p style="margin-top: 30px;"><a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" style="background: #ff4500; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Login Page</a></p>
      </div>
    `);
  } catch (error) {
    console.error("Make admin error:", error);
    res.status(500).send("<h3>Failed to create/promote admin. See server logs.</h3>");
  }
};