import mongoose from "mongoose";

interface MongoConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: MongoConnection | undefined;
}

const cached: MongoConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
};

global.mongooseConnection = cached;

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is not defined");
  }

  // Reuse existing connection in Vercel warm instances
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log("MongoDB Already Connected ✅");
    return;
  }

  // Reuse connection promise if connection is already being established
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoURI, {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 0,
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log("MongoDB Connected Successfully ✅");
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("MongoDB Connection Failed ❌", error);
        throw error;
      });
  }

  cached.conn = await cached.promise;
};

export default connectDB;