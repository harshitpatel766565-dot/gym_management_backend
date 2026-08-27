import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    console.log("MONGO_URI exists:", !!mongoURI);

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    });

    console.log("MongoDB Connected Successfully ✅");
  } catch (error: any) {
    console.error("❌ MongoDB Connection Failed");
    console.error("Error:", error?.message);
    throw error;
  }
};

export default connectDB;