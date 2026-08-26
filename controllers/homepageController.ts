import { Request, Response } from "express";
import HomepageContent from "../models/HomepageContent";

export const getHomepageContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let content = await HomepageContent.findOne();
    if (!content) {
      // Seed default values if none exist
      content = await HomepageContent.create({
        heroTitle: "BUILD YOUR STRONGEST SELF",
        heroSubtitle: "Train harder. Live stronger. Become unstoppable.",
        heroBadgeText: "New Summer Transformation Protocols Live",
        heroBackgroundImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop&q=85",
      });
    }
    res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Get homepage content error:", error);
    res.status(500).json({ success: false, message: "Failed to load homepage content" });
  }
};

export const updateHomepageContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { heroTitle, heroSubtitle, heroBadgeText, heroBackgroundImage } = req.body;
    let content = await HomepageContent.findOne();
    if (!content) {
      content = await HomepageContent.create({
        heroTitle: heroTitle || "BUILD YOUR STRONGEST SELF",
        heroSubtitle: heroSubtitle || "Train harder. Live stronger. Become unstoppable.",
        heroBadgeText: heroBadgeText || "New Summer Transformation Protocols Live",
        heroBackgroundImage: heroBackgroundImage || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&auto=format&fit=crop&q=85",
      });
    } else {
      content.heroTitle = heroTitle || content.heroTitle;
      content.heroSubtitle = heroSubtitle || content.heroSubtitle;
      content.heroBadgeText = heroBadgeText || content.heroBadgeText;
      content.heroBackgroundImage = heroBackgroundImage || content.heroBackgroundImage;
      await content.save();
    }
    res.status(200).json({
      success: true,
      message: "Homepage content updated successfully",
      data: content,
    });
  } catch (error) {
    console.error("Update homepage content error:", error);
    res.status(500).json({ success: false, message: "Failed to update homepage content" });
  }
};
