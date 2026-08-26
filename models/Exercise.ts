import mongoose, { Document, Schema } from "mongoose";

export interface IExercise extends Document {
  name: string;
  targetMuscle: string;
  secondaryMuscles?: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  sets: number;
  reps: string;
  restTimeSeconds: number;
  caloriesBurnedEstimate: number;
  imageUrl: string;
  videoUrl?: string;
  instructions: string[];
  equipmentNeeded: string;
  tips?: string[];
}

const exerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true },
    targetMuscle: { type: String, required: true },
    secondaryMuscles: { type: [String], default: [] },
    difficulty: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    restTimeSeconds: { type: Number, required: true },
    caloriesBurnedEstimate: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    instructions: { type: [String], required: true },
    equipmentNeeded: { type: String, required: true },
    tips: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Exercise = mongoose.model<IExercise>("Exercise", exerciseSchema);
export default Exercise;
