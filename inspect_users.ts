import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User";
import connectDB from "./config/db";

async function inspect() {
  await connectDB();
  console.log("Fetching users from DB...");
  const users = await User.find();
  console.log(`Found ${users.length} users:`);
  users.forEach((u) => {
    console.log({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      passwordHash: u.password.substring(0, 15) + "...",
      hasTrainerField: !!u.trainer,
      trainerId: u.trainer,
    });
  });
  process.exit(0);
}

inspect().catch((err) => {
  console.error("Inspection failed:", err);
  process.exit(1);
});
