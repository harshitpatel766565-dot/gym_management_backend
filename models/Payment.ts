import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  member: mongoose.Types.ObjectId;
  planName: string;
  amount: number;
  currency: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  billingInterval?: "monthly" | "yearly";
  invoiceNumber?: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpayOrderId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "Razorpay",
    },
    billingInterval: {
      type: String,
      enum: ["monthly", "yearly"],
    },
    invoiceNumber: {
      type: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
