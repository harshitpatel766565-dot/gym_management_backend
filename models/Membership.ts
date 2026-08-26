import mongoose, { Document, Schema } from "mongoose";

export interface IMembership extends Document {
  member: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  status: "active" | "inactive" | "expired";
  billingInterval: "monthly" | "yearly";
  amountPaid: number;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    billingInterval: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Membership = mongoose.model<IMembership>("Membership", membershipSchema);

export default Membership;
