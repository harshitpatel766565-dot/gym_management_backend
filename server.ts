import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

// Route imports
import adminRoutes from "./routes/adminRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import authRoutes from "./routes/authRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import contactRoutes from "./routes/contactRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import homepageRoutes from "./routes/homepageRoutes";
import membershipRoutes from "./routes/membershipRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import productRoutes from "./routes/productRoutes";
import programRoutes from "./routes/programRoutes";
import trainerRoutes from "./routes/trainerRoutes";
import userBookingRoutes from "./routes/userBookingRoutes";
import userRoutes from "./routes/userRoutes";
import workoutRoutes from "./routes/workoutRoutes";

dotenv.config();

const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================

const productionFrontend =
  "https://gym-management-frontend-three.vercel.app";

const configuredFrontend = process.env.FRONTEND_URL
  ?.trim()
  .replace(/\/$/, "");

const allowedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      productionFrontend,
      configuredFrontend,
    ].filter(Boolean) as string[]
  )
);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without Origin
      // Example: Postman / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      // Allow all localhost ports during development
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:")
      ) {
        return callback(null, true);
      }

      // Allow production frontend
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ CORS blocked origin:", origin);

      return callback(
        new Error(`Not allowed by CORS: ${origin}`)
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
    ],

    optionsSuccessStatus: 204,
  })
);

// IMPORTANT:
// Do NOT use app.options("*", cors())
// because newer Express/router versions reject "*"
// and cause Vercel FUNCTION_INVOCATION_FAILED.

// =====================================================
// JSON BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// DATABASE CONNECTION
// =====================================================

let dbConnectionPromise: Promise<void> | null = null;

const ensureDatabaseConnection = async (): Promise<void> => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = connectDB().catch((error) => {
      dbConnectionPromise = null;
      throw error;
    });
  }

  await dbConnectionPromise;
};

// =====================================================
// DATABASE MIDDLEWARE
// =====================================================

app.use(async (_req, res, next) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (error) {
    console.error(
      "❌ Database middleware error:",
      error
    );

    res.status(503).json({
      success: false,
      message: "Database connection unavailable",
    });
  }
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/admin", adminRoutes);

app.use("/attendance", attendanceRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/trainer/bookings", bookingRoutes);

app.use("/api/contact", contactRoutes);

app.use("/workouts/exercises", exerciseRoutes);

app.use("/api/homepage", homepageRoutes);

app.use("/memberships", membershipRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/payments", paymentRoutes);

app.use("/api/products", productRoutes);

app.use("/api/programs", programRoutes);

app.use("/api/trainer", trainerRoutes);

app.use("/bookings", userBookingRoutes);

app.use("/users", userRoutes);

app.use("/api/trainer/workouts", workoutRoutes);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "IronForge Fitness Backend is running 🚀",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    database:
      dbConnectionPromise !== null
        ? "connection initialized"
        : "not connected",
  });
});

// =====================================================
// LOCAL SERVER
// =====================================================

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `Server is running locally on port ${PORT} 🚀`
    );
  });
}

export default app;