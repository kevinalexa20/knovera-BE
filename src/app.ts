import express from "express";
import authRoute from "./routes/authRoute";
import dotenv from "dotenv";
import courseRoute from "./routes/courseRoute";
import cors from "cors";
import userRoute from "./routes/userRoute";
import sectionRoute from "./routes/sectionRoute";
import { errorHandler } from "./middleware/errorHandler";
import enrollmentRoute from "./routes/enrollmentRoute";
import categoryRoute from "./routes/categoryRoute";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/items", itemRoutes);
// app.use("/api/orders", orderRoutes);

// app.use(errorHandler);

app.use("/auth", authRoute);
// app.use("/courses", courseRoute);
app.use("/users", userRoute);
app.use("/api/courses", courseRoute);
app.use("/api/courses/:courseId/sections", sectionRoute);
app.use("/enrollments", enrollmentRoute);
app.use("/api/categories", categoryRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Supabase URL:", process.env.SUPABASE_URL);
});

export default app;
