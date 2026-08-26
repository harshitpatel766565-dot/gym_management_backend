import mongoose, { Document, Schema } from "mongoose";

export interface IProgress extends Document {
  member: mongoose.Types.ObjectId;
  trainer: mongoose.Types.ObjectId;
  weight: number;
  bodyFatPercentage?: number;
  chest?: number;
  waist?: number;
  arms?: number;
  legs?: number;
  workoutDurationMinutes: number;
  caloriesBurned: number;
  notes?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    bodyFatPercentage: {
      type: Number,
    },
    chest: {
      type: Number,
    },
    waist: {
      type: Number,
    },
    arms: {
      type: Number,
    },
    legs: {
      type: Number,
    },
    workoutDurationMinutes: {
      type: Number,
      required: true,
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Progress = mongoose.model<IProgress>("Progress", progressSchema);

export default Progress;
