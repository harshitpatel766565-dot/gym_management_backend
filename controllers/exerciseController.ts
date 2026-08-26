import { Request, Response } from "express";
import Exercise from "../models/Exercise";

export const getExercises = async (req: Request, res: Response): Promise<void> => {
  try {
    let exercises = await Exercise.find().sort({ name: 1 });

    if (exercises.length === 0) {
      // Auto seed some default exercises
      const defaults = [
        {
          name: "Barbell Bench Press",
          targetMuscle: "Chest",
          secondaryMuscles: ["Triceps", "Front Deltoids"],
          difficulty: "Intermediate",
          sets: 4,
          reps: "8-10",
          restTimeSeconds: 90,
          caloriesBurnedEstimate: 120,
          imageUrl: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500",
          instructions: ["Lie flat on bench with eyes aligned directly beneath the bar.", "Grip the bar slightly wider than shoulder width.", "Lower the bar smoothly to mid-chest.", "Press the bar explosively back to starting position."],
          equipmentNeeded: "Barbell, Olympic Flat Bench",
        },
        {
          name: "Deadlift (Conventional)",
          targetMuscle: "Back",
          secondaryMuscles: ["Hamstrings", "Glutes", "Traps"],
          difficulty: "Advanced",
          sets: 5,
          reps: "5",
          restTimeSeconds: 150,
          caloriesBurnedEstimate: 180,
          imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500",
          instructions: ["Stand with feet hip-width apart, barbell over mid-foot.", "Hinge at hips to grip the bar just outside your shins.", "Brace your core, flatten back, and drive through the floor to stand tall.", "Lock hips and knees simultaneously at the top, then lower with control."],
          equipmentNeeded: "Olympic Barbell, Bumper Plates",
        },
        {
          name: "Barbell Back Squat",
          targetMuscle: "Legs",
          secondaryMuscles: ["Quadriceps", "Glutes", "Calves"],
          difficulty: "Advanced",
          sets: 4,
          reps: "6-8",
          restTimeSeconds: 120,
          caloriesBurnedEstimate: 160,
          imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500",
          instructions: ["Rest barbell securely across upper traps with hands gripping firm.", "Step back, set feet shoulder-width with toes slightly flared.", "Squat down until thighs are parallel to ground.", "Drive powerfully out of the hole through the mid-foot."],
          equipmentNeeded: "Squat Rack, Barbell",
        }
      ];
      exercises = await Exercise.create(defaults);
    }

    res.status(200).json({
      success: true,
      message: "Exercises fetched successfully",
      data: exercises.map(e => ({
        id: e._id.toString(),
        name: e.name,
        targetMuscle: e.targetMuscle,
        secondaryMuscles: e.secondaryMuscles,
        difficulty: e.difficulty,
        sets: e.sets,
        reps: e.reps,
        restTimeSeconds: e.restTimeSeconds,
        caloriesBurnedEstimate: e.caloriesBurnedEstimate,
        imageUrl: e.imageUrl,
        videoUrl: e.videoUrl,
        instructions: e.instructions,
        equipmentNeeded: e.equipmentNeeded,
        tips: e.tips
      }))
    });
  } catch (error) {
    console.error("Get exercises error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch exercises" });
  }
};

export const getExerciseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const e = await Exercise.findById(id);
    if (!e) {
      res.status(404).json({ success: false, message: "Exercise not found" });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        id: e._id.toString(),
        name: e.name,
        targetMuscle: e.targetMuscle,
        secondaryMuscles: e.secondaryMuscles,
        difficulty: e.difficulty,
        sets: e.sets,
        reps: e.reps,
        restTimeSeconds: e.restTimeSeconds,
        caloriesBurnedEstimate: e.caloriesBurnedEstimate,
        imageUrl: e.imageUrl,
        videoUrl: e.videoUrl,
        instructions: e.instructions,
        equipmentNeeded: e.equipmentNeeded,
        tips: e.tips
      }
    });
  } catch (error) {
    console.error("Get exercise by id error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch exercise" });
  }
};

export const createExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const e = await Exercise.create(req.body);
    res.status(201).json({
      success: true,
      message: "Exercise created successfully",
      data: {
        id: e._id.toString(),
        name: e.name,
        targetMuscle: e.targetMuscle,
        secondaryMuscles: e.secondaryMuscles,
        difficulty: e.difficulty,
        sets: e.sets,
        reps: e.reps,
        restTimeSeconds: e.restTimeSeconds,
        caloriesBurnedEstimate: e.caloriesBurnedEstimate,
        imageUrl: e.imageUrl,
        videoUrl: e.videoUrl,
        instructions: e.instructions,
        equipmentNeeded: e.equipmentNeeded,
        tips: e.tips
      }
    });
  } catch (error) {
    console.error("Create exercise error:", error);
    res.status(500).json({ success: false, message: "Failed to create exercise" });
  }
};

export const deleteExercise = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const e = await Exercise.findByIdAndDelete(id);
    if (!e) {
      res.status(404).json({ success: false, message: "Exercise not found" });
      return;
    }
    res.status(200).json({ success: true, message: "Exercise deleted successfully" });
  } catch (error) {
    console.error("Delete exercise error:", error);
    res.status(500).json({ success: false, message: "Failed to delete exercise" });
  }
};
