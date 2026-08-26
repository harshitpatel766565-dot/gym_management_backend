import { Request, Response } from "express";
import Contact from "../models/Contact";

export const createContact = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, phone, interest, message } = req.body;

    if (!name || !email || !phone || !interest || !message) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      interest,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Contact form error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};