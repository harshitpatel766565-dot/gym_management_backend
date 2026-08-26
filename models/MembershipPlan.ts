import mongoose, { Document, Schema } from "mongoose";

export interface IMembershipPlan extends Document {
  name: string;
  tagline?: string;
  description?: string;
  duration: number; // in days
  monthlyPrice: number;
  yearlyPrice: number;
  isPopular?: boolean;
  features: {
    title: string;
    included: boolean;
    description?: string;
  }[];
  accessHours: string;
  guestPassesPerMonth: number;
  trainerSessionsPerMonth: number;
  dietConsultationsPerQuarter: number;
  saunaAccess: boolean;
  lockerAccess: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const membershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: true, // e.g. 30, 365
    },
    monthlyPrice: {
      type: Number,
      required: true,
    },
    yearlyPrice: {
      type: Number,
      required: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    features: {
      type: [
        {
          title: { type: String, required: true },
          included: { type: Boolean, default: true },
          description: { type: String },
        },
      ],
      default: [],
    },
    accessHours: {
      type: String,
      default: "24/7 Access",
    },
    guestPassesPerMonth: {
      type: Number,
      default: 0,
    },
    trainerSessionsPerMonth: {
      type: Number,
      default: 0,
    },
    dietConsultationsPerQuarter: {
      type: Number,
      default: 0,
    },
    saunaAccess: {
      type: Boolean,
      default: false,
    },
    lockerAccess: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const MembershipPlan = mongoose.model<IMembershipPlan>(
  "MembershipPlan",
  membershipPlanSchema
);

export default MembershipPlan;
