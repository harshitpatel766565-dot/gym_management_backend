import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User";
import connectDB from "./config/db";

async function createAdmin() {
  await connectDB();

  const adminEmail = "admin@ironforge.com";
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log(`✅ User with email ${adminEmail} is now an admin.`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await User.create({
    name: "System Admin",
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    isActive: true,
  });

  console.log("=========================================");
  console.log("✅ Admin account created successfully!");
  console.log(`📧 Email: ${adminEmail}`);
  console.log("🔑 Password: admin123");
  console.log("=========================================");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
