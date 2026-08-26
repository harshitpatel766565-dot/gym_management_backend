import mongoose, { Document, Schema } from "mongoose";

export interface IProgram extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  imageUrl?: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationWeeks: number;
  sessionsPerWeek: number;
  estimatedCaloriesPerSession?: number;
  trainerName?: string;
  trainerAvatar?: string;
  trainerId?: string;
  enrolledCount: number;
  rating: number;
  equipment: string[];
  scheduleOverview?: Array<{ day: string; focus: string; duration: string }>;
  exercises?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const programSchema = new Schema<IProgram>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    fullDescription: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    durationWeeks: {
      type: Number,
      required: true,
      default: 8,
    },
    sessionsPerWeek: {
      type: Number,
      required: true,
      default: 4,
    },
    estimatedCaloriesPerSession: {
      type: Number,
      default: 500,
    },
    trainerName: {
      type: String,
      default: "Marcus Vance",
    },
    trainerAvatar: {
      type: String,
      default: "",
    },
    trainerId: {
      type: String,
      default: "trn-1",
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    equipment: {
      type: [String],
      default: [],
    },
    scheduleOverview: {
      type: [
        {
          day: { type: String },
          focus: { type: String },
          duration: { type: String },
        },
      ],
      default: [],
    },
    exercises: {
      type: [Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Program = mongoose.model<IProgram>("Program", programSchema);

export default Program;
