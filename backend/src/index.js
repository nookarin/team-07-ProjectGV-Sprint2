import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js";
import { router as apiRoutes } from "./routes/index.js";

// ✅ เพิ่มอันนี้
import { stripeWebhookRouter } from "./routes/stripeWebhook.route.js";


const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://team-07-project-gv-sprint2.vercel.app",
  ],
  credentials: true,
};


const app = express();

const port = process.env.PORT || 3000;


// =======================================
// Stripe Webhook
// สำคัญ: ต้องอยู่ก่อน express.json()
// =======================================

app.use(
  "/api/v1/stripe",
  stripeWebhookRouter
);


// =======================================
// Middleware ปกติ
// =======================================

app.use(express.json());

app.use(cookieParser());

app.use(cors(corsOptions));


// =======================================
// API Routes ปกติ
// =======================================

app.use("/api", apiRoutes);


// =======================================
// Error Handler
// =======================================

app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on the server!",
    message: err.message,
  });
});


// =======================================
// Start Server
// =======================================

async function start() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on port: ${port} 🏃‍♀️`);
    });
  } catch (err) {
    console.error(
      "Failed to connect to MongoDB:",
      err.message
    );

    process.exit(1);
  }
}

start();