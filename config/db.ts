import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined");
    }

    // Already connected
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected ✅");
      return;
    }

    // Connection currently being established
    if (mongoose.connection.readyState === 2) {
      await mongoose.connection.asPromise();
      return;
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,

      maxPoolSize: 10,
      minPoolSize: 1,

      retryWrites: true,
    });

    console.log("MongoDB Connected Successfully ✅");
  } catch (error) {
    console.error("MongoDB Connection Failed ❌", error);
    throw error;
  }
};

export default connectDB;