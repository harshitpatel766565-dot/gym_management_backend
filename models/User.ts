import mongoose, { Document, Schema } from "mongoose";

export interface IUserProfile {
  age?: number;
  gender?: "male" | "female" | "other";
  height?: number;
  weight?: number;
  targetWeight?: number;
  fitnessGoal?: "muscle_gain" | "weight_loss" | "strength" | "endurance" | "general_fitness";
  activityLevel?: "sedentary" | "light" | "moderate" | "very_active" | "extra_active";
  bmi?: number;
  bodyFatPercentage?: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: "user" | "trainer" | "admin";
  trainer?: mongoose.Types.ObjectId | null;
  profile?: IUserProfile;
  isActive?: boolean;
  title?: string;
  specialization?: string;
  experienceYears?: number;
  hourlyRate?: number;
  bio?: string;
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  activeClientsCount?: number;
  availableDays?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "trainer", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      default: "",
    },

    experienceYears: {
      type: Number,
      default: 0,
    },

    hourlyRate: {
      type: Number,
      default: 0,
    },

    bio: {
      type: String,
      default: "",
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    activeClientsCount: {
      type: Number,
      default: 0,
    },

    availableDays: {
      type: [String],
      default: [],
    },

    profile: {
      age: { type: Number },
      gender: { type: String, enum: ["male", "female", "other"] },
      height: { type: Number },
      weight: { type: Number },
      targetWeight: { type: Number },
      fitnessGoal: { type: String, enum: ["muscle_gain", "weight_loss", "strength", "endurance", "general_fitness"] },
      activityLevel: { type: String, enum: ["sedentary", "light", "moderate", "very_active", "extra_active"] },
      bmi: { type: Number },
      bodyFatPercentage: { type: Number },
      emergencyContactName: { type: String },
      emergencyContactPhone: { type: String },
      medicalConditions: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;