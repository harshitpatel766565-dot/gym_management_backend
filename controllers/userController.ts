import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import User from "../models/User";
import { getParam } from "../utils/param";

// ==========================================
// UPDATE USER PROFILE
// ==========================================
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getParam(req.params, "userId");
    const profileData = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    // Security check: normal user can only update their own profile
    if (req.user?.role === "user" && req.user.id !== userId) {
      res.status(403).json({ success: false, message: "Access denied. Can only update own profile." });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Update flat fields (name, phone) if provided
    if (profileData.name !== undefined) user.name = profileData.name.trim();
    if (profileData.phone !== undefined) user.phone = profileData.phone.trim();

    // Update profile object
    if (!user.profile) {
      user.profile = {};
    }

    const profileFields = [
      "age",
      "gender",
      "height",
      "weight",
      "targetWeight",
      "fitnessGoal",
      "activityLevel",
      "bodyFatPercentage",
      "emergencyContactName",
      "emergencyContactPhone",
      "medicalConditions",
    ];

    for (const field of profileFields) {
      if (profileData[field] !== undefined) {
        (user.profile as any)[field] = profileData[field];
      }
    }

    // Auto calculate BMI if height & weight exist
    if (user.profile.weight && user.profile.height) {
      const heightInMeters = user.profile.height / 100;
      user.profile.bmi = parseFloat((user.profile.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    await user.save();

    // Format response
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      profile: user.profile,
      createdAt: user.createdAt?.toISOString() || "",
      updatedAt: user.updatedAt?.toISOString() || "",
      isActive: true,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userData,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};
