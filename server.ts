import "dotenv/config";

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

import connectDB from "./config/db";

import authRoutes from "./routes/authRoutes";
import contactRoutes from "./routes/contactRoutes";
import trainerRoutes from "./routes/trainerRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import programRoutes from "./routes/programRoutes";
import adminRoutes from "./routes/adminRoutes";
import userRoutes from "./routes/userRoutes";
import attendanceRoutes from "./routes/attendanceRoutes";
import membershipRoutes from "./routes/membershipRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import productRoutes from "./routes/productRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import userBookingRoutes from "./routes/userBookingRoutes";
import homepageRoutes from "./routes/homepageRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";

import {
  getTrainers,
  getTrainerById,
} from "./controllers/adminController";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      
      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
      const isFrontendUrl = process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL;
      
      if (isLocalhost || isFrontendUrl) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Ensure MongoDB is connected before handling any route requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// ==========================================
// BODY PARSER
// ==========================================

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

// ==========================================
// UPLOADS DIRECTORY
// ==========================================

const uploadsDir = process.env.VERCEL
  ? "/tmp"
  : path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

// Serve uploaded files
app.use(
  "/uploads",
  express.static(uploadsDir)
);

// ==========================================
// IMAGE UPLOAD
// ==========================================

app.post("/api/upload", (req, res): void => {
  try {
    const { image } = req.body;

    if (!image) {
      res.status(400).json({
        success: false,
        message: "No image data provided",
      });
      return;
    }

    const matches = image.match(
      /^data:([A-Za-z-+/]+);base64,(.+)$/
    );

    if (!matches || matches.length !== 3) {
      res.status(400).json({
        success: false,
        message:
          "Invalid base64 image format",
      });
      return;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    const buffer = Buffer.from(
      base64Data,
      "base64"
    );

    const extension =
      mimeType.split("/")[1] || "png";

    const filename =
      `product-${Date.now()}.${extension}`;

    const filePath = path.join(
      uploadsDir,
      filename
    );

    fs.writeFileSync(
      filePath,
      buffer
    );

    const fileUrl =
      `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    res.status(200).json({
      success: true,
      message:
        "Image uploaded successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error(
      "Upload handler error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
});

// ==========================================
// DATABASE
// ==========================================

connectDB();

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Gym API is running 🚀",
  });
});

// ==========================================
// AUTH
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

// ==========================================
// CONTACT
// ==========================================

app.use(
  "/api/contact",
  contactRoutes
);

// ==========================================
// TRAINER
// ==========================================

app.use(
  "/api/trainer",
  trainerRoutes
);

app.use(
  "/api/trainer/workouts",
  workoutRoutes
);

app.use(
  "/api/trainer/bookings",
  bookingRoutes
);

// ==========================================
// PROGRAMS
// ==========================================

app.use(
  "/api/programs",
  programRoutes
);

// ==========================================
// ADMIN
// ==========================================

app.use(
  "/api/admin",
  adminRoutes
);

// ==========================================
// HOMEPAGE
// ==========================================

app.use(
  "/api/homepage",
  homepageRoutes
);

// ==========================================
// USERS
// ==========================================

app.use(
  "/users",
  userRoutes
);

// ==========================================
// ATTENDANCE
// ==========================================

app.use(
  "/attendance",
  attendanceRoutes
);

// ==========================================
// MEMBERSHIPS
// ==========================================

app.use(
  "/memberships",
  membershipRoutes
);

// ==========================================
// PAYMENTS
// ==========================================

app.use(
  "/payments",
  paymentRoutes
);

// ==========================================
// USER BOOKINGS
// ==========================================

app.use(
  "/bookings",
  userBookingRoutes
);

// ==========================================
// EXERCISES
// ==========================================

app.use(
  "/workouts/exercises",
  exerciseRoutes
);

// ==========================================
// PRODUCTS
// ==========================================

app.use(
  "/api/products",
  productRoutes
);

// ==========================================
// NOTIFICATIONS
// ==========================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// ==========================================
// PUBLIC TRAINERS
// ==========================================

app.get(
  "/api/trainers",
  getTrainers
);

app.get(
  "/api/trainers/:id",
  getTrainerById
);

// ==========================================
// SERVER
// ==========================================

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;