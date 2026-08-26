import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import MembershipPlan from "../models/MembershipPlan";
import Membership from "../models/Membership";
import User from "../models/User";

// ==========================================
// GET MEMBERSHIP PLANS (PUBLIC)
// ==========================================
export const getPlans = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const plans = await MembershipPlan.find({ isActive: true });
    
    // Seed plans if none exist in the database
    if (plans.length === 0) {
      const defaultPlans = [
        {
          name: "Basic",
          tagline: "Essential access for beginners",
          description: "Essential gym access and locker usage.",
          duration: 30,
          monthlyPrice: 1499,
          yearlyPrice: 14990,
          isPopular: false,
          accessHours: "6:00 AM – 10:00 PM",
          guestPassesPerMonth: 0,
          trainerSessionsPerMonth: 0,
          dietConsultationsPerQuarter: 0,
          saunaAccess: false,
          lockerAccess: true,
          features: [
            { title: "Access to Gym Floor", included: true },
            { title: "Locker room access", included: true },
            { title: "1 Fitness assessment", included: true },
            { title: "Group classes", included: false },
            { title: "Personal trainer sessions", included: false }
          ],
          isActive: true
        },
        {
          name: "Pro",
          tagline: "Most popular training tier",
          description: "All basic features plus trainer assistance.",
          duration: 30,
          monthlyPrice: 2999,
          yearlyPrice: 29990,
          isPopular: true,
          accessHours: "5:00 AM – 11:00 PM",
          guestPassesPerMonth: 2,
          trainerSessionsPerMonth: 2,
          dietConsultationsPerQuarter: 0,
          saunaAccess: true,
          lockerAccess: true,
          features: [
            { title: "Access to Gym Floor", included: true },
            { title: "Locker room access", included: true },
            { title: "Group classes", included: true },
            { title: "2 Personal trainer sessions/mo", included: true },
            { title: "Sauna access", included: true }
          ],
          isActive: true
        },
        {
          name: "Elite",
          tagline: "Ultimate personalized coaching",
          description: "Complete access, unlimited classes, personal coach.",
          duration: 30,
          monthlyPrice: 4999,
          yearlyPrice: 49990,
          isPopular: false,
          accessHours: "24/7 Access",
          guestPassesPerMonth: 5,
          trainerSessionsPerMonth: 8,
          dietConsultationsPerQuarter: 1,
          saunaAccess: true,
          lockerAccess: true,
          features: [
            { title: "24/7 Access to gym", included: true },
            { title: "Unlimited group classes", included: true },
            { title: "Dedicated personal trainer", included: true },
            { title: "Diet & nutrition plan", included: true },
            { title: "Sauna & recovery zone", included: true }
          ],
          isActive: true
        }
      ];
      const seeded = await MembershipPlan.insertMany(defaultPlans);
      
      const formattedSeeded = seeded.map(p => ({
        id: p._id.toString(),
        name: p.name,
        tagline: p.tagline || "",
        description: p.description || "",
        durationDays: p.duration,
        monthlyPrice: p.monthlyPrice,
        yearlyPrice: p.yearlyPrice,
        isPopular: p.isPopular || false,
        features: p.features || [],
        accessHours: p.accessHours || "24/7 Access",
        guestPassesPerMonth: p.guestPassesPerMonth || 0,
        trainerSessionsPerMonth: p.trainerSessionsPerMonth || 0,
        dietConsultationsPerQuarter: p.dietConsultationsPerQuarter || 0,
        saunaAccess: p.saunaAccess || false,
        lockerAccess: p.lockerAccess || false,
        isActive: p.isActive,
      }));

      res.status(200).json({
        success: true,
        message: "Membership plans seeded",
        data: formattedSeeded
      });
      return;
    }

    // Format structure to fit frontend types
    const formatted = plans.map(p => ({
      id: p._id.toString(),
      name: p.name,
      tagline: p.tagline || "",
      description: p.description || "",
      durationDays: p.duration,
      monthlyPrice: p.monthlyPrice,
      yearlyPrice: p.yearlyPrice,
      isPopular: p.isPopular || false,
      features: p.features || [],
      accessHours: p.accessHours || "24/7 Access",
      guestPassesPerMonth: p.guestPassesPerMonth || 0,
      trainerSessionsPerMonth: p.trainerSessionsPerMonth || 0,
      dietConsultationsPerQuarter: p.dietConsultationsPerQuarter || 0,
      saunaAccess: p.saunaAccess || false,
      lockerAccess: p.lockerAccess || false,
      isActive: p.isActive,
    }));

    res.status(200).json({
      success: true,
      message: "Membership plans loaded",
      data: formatted,
    });
  } catch (error) {
    console.error("Get plans error:", error);
    res.status(500).json({ success: false, message: "Failed to load membership plans" });
  }
};

// ==========================================
// GET USER ACTIVE MEMBERSHIP
// ==========================================
export const getUserMembership = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const membership = await Membership.findOne({
      member: new mongoose.Types.ObjectId(userId),
      status: "active",
    }).populate("plan");

    if (!membership) {
      res.status(200).json({
        success: true,
        message: "No active membership found",
        data: null,
      });
      return;
    }

    const now = new Date().getTime();
    const end = new Date(membership.endDate).getTime();
    const daysRemaining = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));

    const formatted = {
      id: membership._id.toString(),
      userId: membership.member.toString(),
      planId: (membership.plan as any)?._id?.toString() || "",
      plan: membership.plan ? {
        id: (membership.plan as any)._id.toString(),
        name: (membership.plan as any).name,
        description: (membership.plan as any).description,
        features: (membership.plan as any).features,
      } : null,
      status: membership.status,
      billingInterval: membership.billingInterval,
      amountPaid: membership.amountPaid,
      startDate: membership.startDate.toISOString(),
      endDate: membership.endDate.toISOString(),
      daysRemaining,
      autoRenew: membership.autoRenew,
      paymentId: membership.paymentId || "",
    };

    res.status(200).json({
      success: true,
      message: "Membership details retrieved",
      data: formatted,
    });
  } catch (error) {
    console.error("Get user membership error:", error);
    res.status(500).json({ success: false, message: "Failed to load membership details" });
  }
};

// ==========================================
// ACTIVATE MEMBERSHIP
// ==========================================
export const activateMembership = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId, planId, billingInterval, paymentId } = req.body;

    if (!userId || !planId || !billingInterval) {
      res.status(400).json({ success: false, message: "Missing required activation fields" });
      return;
    }

    let plan;
    if (mongoose.Types.ObjectId.isValid(planId)) {
      plan = await MembershipPlan.findById(planId);
    } else {
      let searchName = "Basic Plan";
      const planStr = String(planId).toLowerCase();
      if (planStr.includes("pro") || planStr.includes("premium")) {
        searchName = "Premium Plan";
      } else if (planStr.includes("elite")) {
        searchName = "Elite Plan";
      }
      plan = await MembershipPlan.findOne({ name: searchName });
    }

    if (!plan) {
      res.status(404).json({ success: false, message: "Membership plan not found in database" });
      return;
    }

    const durationDays = billingInterval === "yearly" ? 365 : 30;
    const startDate = new Date();
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    const amountPaid = billingInterval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

    // Set any previous active memberships to inactive
    await Membership.updateMany(
      { member: new mongoose.Types.ObjectId(userId), status: "active" },
      { status: "inactive" }
    );

    const membership = await Membership.create({
      member: new mongoose.Types.ObjectId(userId),
      plan: plan._id,
      status: "active",
      billingInterval,
      amountPaid,
      startDate,
      endDate,
      autoRenew: true,
      paymentId,
    });

    const formatted = {
      id: membership._id.toString(),
      userId: membership.member.toString(),
      planId: plan._id.toString(),
      plan: {
        id: plan._id.toString(),
        name: plan.name,
        description: plan.description,
        features: plan.features,
      },
      status: membership.status,
      billingInterval: membership.billingInterval,
      amountPaid: membership.amountPaid,
      startDate: membership.startDate.toISOString(),
      endDate: membership.endDate.toISOString(),
      daysRemaining: durationDays,
      autoRenew: membership.autoRenew,
      paymentId: membership.paymentId || "",
    };

    res.status(201).json({
      success: true,
      message: `Your ${plan.name} is now active!`,
      data: formatted,
    });
  } catch (error) {
    console.error("Activate membership error:", error);
    res.status(500).json({ success: false, message: "Failed to activate membership" });
  }
};

export const createPlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      tagline,
      description,
      duration,
      monthlyPrice,
      yearlyPrice,
      isPopular,
      features,
      accessHours,
      guestPassesPerMonth,
      trainerSessionsPerMonth,
      dietConsultationsPerQuarter,
      saunaAccess,
      lockerAccess,
    } = req.body;

    if (!name || duration === undefined || monthlyPrice === undefined || yearlyPrice === undefined) {
      res.status(400).json({ success: false, message: "Name, duration and pricing are required" });
      return;
    }

    const plan = await MembershipPlan.create({
      name,
      tagline,
      description,
      duration,
      monthlyPrice,
      yearlyPrice,
      isPopular,
      features,
      accessHours,
      guestPassesPerMonth,
      trainerSessionsPerMonth,
      dietConsultationsPerQuarter,
      saunaAccess,
      lockerAccess,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Membership plan created successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Create plan error:", error);
    res.status(500).json({ success: false, message: "Failed to create plan" });
  }
};

// ==========================================
// ADMIN: EDIT MEMBERSHIP PLAN
// ==========================================
export const updatePlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const plan = await MembershipPlan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Membership plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Update plan error:", error);
    res.status(500).json({ success: false, message: "Failed to update plan" });
  }
};

// ==========================================
// ADMIN: DELETE MEMBERSHIP PLAN
// ==========================================
export const deletePlan = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await MembershipPlan.findByIdAndDelete(id);

    if (!plan) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Membership plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete plan error:", error);
    res.status(500).json({ success: false, message: "Failed to delete plan" });
  }
};
