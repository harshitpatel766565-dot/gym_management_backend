import mongoose, { Document, Schema } from "mongoose";

export interface IWorkout extends Document {
  trainer: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;

  name: string;
  goal?: string;

  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
    restSeconds?: number;
    notes?: string;
  }[];

  status: "active" | "completed";
  startDate?: Date;
  endDate?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const workoutSchema = new Schema<IWorkout>(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    goal: {
      type: String,
      trim: true,
    },

    exercises: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        sets: {
          type: Number,
          required: true,
          min: 1,
        },

        reps: {
          type: Number,
          required: true,
          min: 1,
        },

        weight: {
          type: Number,
          min: 0,
        },

        restSeconds: {
          type: Number,
          min: 0,
        },

        notes: {
          type: String,
          trim: true,
        },
      },
    ],

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Workout = mongoose.model<IWorkout>(
  "Workout",
  workoutSchema
);

export default Workout;