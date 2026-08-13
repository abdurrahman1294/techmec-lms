import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import prisma from "./lib/prisma";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import adminRoutes from "./routes/admin.routes";
import courseRoutes from "./routes/course.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import lessonRoutes from "./routes/lesson.routes";
import cartRoutes from "./routes/cart.routes";
import assistantRoutes from "./routes/assistant.routes";
import uploadRoutes from "./routes/upload.routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve uploaded thumbnails
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the Mech Spec LMS API 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", adminRoutes);
app.use("/api", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", lessonRoutes);
app.use("/api", cartRoutes);
app.use("/api", assistantRoutes);
app.use("/api", uploadRoutes);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database");
    console.error(error);
  }
}

startServer();
