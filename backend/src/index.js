import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { router as apiRoutes } from "./routes/index.js";
import cookieParser from "cookie-parser";

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://team-07-project-gv-sprint2.vercel.app",
  ],
  credentials: true,
};

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api", apiRoutes);

//Centralize error handling middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on the server!",
    message: err.message,
  });
});

async function start() {
  try {

    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on port: ${port} 🏃‍♀️`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }
}

start();
