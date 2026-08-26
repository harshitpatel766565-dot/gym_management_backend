import { Request, Response } from "express";
import Program from "../models/Program";
import { getParam } from "../utils/param";

// ==========================================
// GET ALL PROGRAMS
// ==========================================
export const getPrograms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const programs = await Program.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Programs fetched successfully",
      data: programs,
    });
  } catch (error) {
    console.error("Get programs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch programs",
    });
  }
};

// ==========================================
// GET PROGRAM BY ID
// ==========================================
export const getProgramById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParam(req.params, "id");
    
    let program;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      program = await Program.findById(id);
    } else {
      program = await Program.findOne({ slug: id });
    }

    if (!program) {
      res.status(404).json({
        success: false,
        message: "Program not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Program fetched successfully",
      data: program,
    });
  } catch (error) {
    console.error("Get program by id error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch program details",
    });
  }
};

// ==========================================
// CREATE PROGRAM
// ==========================================
export const createProgram = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      shortDescription,
      fullDescription,
      imageUrl,
      difficulty,
      durationWeeks,
      sessionsPerWeek,
      estimatedCaloriesPerSession,
      trainerName,
      trainerAvatar,
      trainerId,
      equipment,
      scheduleOverview,
      exercises,
    } = req.body;

    if (!title || !shortDescription) {
      res.status(400).json({
        success: false,
        message: "Title and short description are required",
      });
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check if slug already exists, append unique string if needed
    let finalSlug = slug;
    let count = 1;
    while (await Program.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${count}`;
      count++;
    }

    const program = await Program.create({
      title: title.trim(),
      slug: finalSlug,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription?.trim() || shortDescription.trim(),
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      difficulty: difficulty || "Intermediate",
      durationWeeks: Number(durationWeeks) || 8,
      sessionsPerWeek: Number(sessionsPerWeek) || 4,
      estimatedCaloriesPerSession: Number(estimatedCaloriesPerSession) || 500,
      trainerName: trainerName || "Marcus Vance",
      trainerAvatar: trainerAvatar || "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=300",
      trainerId: trainerId || "trn-1",
      enrolledCount: 0,
      rating: 5.0,
      equipment: equipment || ["Barbells", "Dumbbells"],
      scheduleOverview: scheduleOverview || [],
      exercises: exercises || [],
    });

    res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: program,
    });
  } catch (error) {
    console.error("Create program error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create program",
    });
  }
};

// ==========================================
// UPDATE PROGRAM
// ==========================================
export const updateProgram = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
    }

    const program = await Program.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!program) {
      res.status(404).json({
        success: false,
        message: "Program not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Program updated successfully",
      data: program,
    });
  } catch (error) {
    console.error("Update program error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update program",
    });
  }
};

// ==========================================
// DELETE PROGRAM
// ==========================================
export const deleteProgram = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const program = await Program.findByIdAndDelete(id);

    if (!program) {
      res.status(404).json({
        success: false,
        message: "Program not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    console.error("Delete program error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete program",
    });
  }
};
