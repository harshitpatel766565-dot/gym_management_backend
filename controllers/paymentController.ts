import { Request, Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import Payment from "../models/Payment";
import Membership from "../models/Membership";
import MembershipPlan from "../models/MembershipPlan";
import User from "../models/User";
import { getParam } from "../utils/param";

// ==========================================
// CREATE RAZORPAY ORDER (MOCK/SIMULATION ON BACKEND)
// ==========================================
export const createRazorpayOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || !receipt) {
      res.status(400).json({ success: false, message: "Amount and receipt ID are required" });
      return;
    }

    // Return a mock Razorpay order that will be used by frontend
    const mockOrder = {
      id: `order_IF_${Date.now().toString().slice(-6)}`,
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: receipt,
      status: "created",
    };

    res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",
      data: mockOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
};

// ==========================================
// VERIFY PAYMENT & ACTIVATE MEMBERSHIP
// ==========================================
export const verifyPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      userId,
      planId,
      billingInterval,
    } = req.body;

    if (!userId || !planId || !billingInterval) {
      res.status(400).json({ success: false, message: "Missing required verification fields" });
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

    const amount = billingInterval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const paymentId = razorpay_payment_id || `pay_ironforge_${Date.now()}`;

    // 1. Save payment record to MongoDB
    const payment = await Payment.create({
      member: new mongoose.Types.ObjectId(userId),
      planName: `${plan.name} Membership`,
      amount,
      currency: "INR",
      razorpayPaymentId: paymentId,
      razorpayOrderId: razorpay_order_id || `ord_${Date.now()}`,
      razorpaySignature: razorpay_signature || `sig_${Date.now()}`,
      status: "paid",
      paymentMethod: "UPI/Card",
      billingInterval,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date(),
    });

    // 2. Create/Update Membership subscription in MongoDB
    const durationDays = billingInterval === "yearly" ? 365 : 30;
    const startDate = new Date();
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    await Membership.updateMany(
      { member: new mongoose.Types.ObjectId(userId), status: "active" },
      { status: "inactive" }
    );

    await Membership.create({
      member: new mongoose.Types.ObjectId(userId),
      plan: plan._id,
      status: "active",
      billingInterval,
      amountPaid: amount,
      startDate,
      endDate,
      autoRenew: true,
      paymentId: paymentId,
    });

    // Format transaction response matching frontend expected type
    const formattedTransaction = {
      id: payment._id.toString(),
      userId: payment.member.toString(),
      userName: user.name,
      userEmail: user.email,
      planId: plan._id.toString(),
      planName: payment.planName,
      amount: payment.amount,
      currency: payment.currency,
      razorpayPaymentId: payment.razorpayPaymentId,
      razorpayOrderId: payment.razorpayOrderId,
      razorpaySignature: payment.razorpaySignature,
      status: "success",
      paymentMethod: payment.paymentMethod,
      billingInterval: payment.billingInterval,
      createdAt: payment.date.toISOString(),
      invoiceNumber: payment.invoiceNumber,
    };

    res.status(200).json({
      success: true,
      message: "Payment verified and membership activated!",
      data: formattedTransaction,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

// ==========================================
// GET USER TRANSACTIONS
// ==========================================
export const getUserTransactions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getParam(req.params, "userId");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ success: false, message: "Invalid user ID" });
      return;
    }

    const payments = await Payment.find({
      member: new mongoose.Types.ObjectId(userId),
    }).sort({ date: -1 });

    const formatted = payments.map(p => ({
      id: p._id.toString(),
      userId: p.member.toString(),
      planName: p.planName,
      amount: p.amount,
      currency: p.currency,
      razorpayPaymentId: p.razorpayPaymentId || "",
      razorpayOrderId: p.razorpayOrderId || "",
      status: p.status === "paid" ? "success" : p.status,
      paymentMethod: p.paymentMethod || "UPI",
      billingInterval: p.billingInterval || "monthly",
      createdAt: p.date.toISOString(),
      invoiceNumber: p.invoiceNumber || "",
    }));

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transaction logs" });
  }
};
