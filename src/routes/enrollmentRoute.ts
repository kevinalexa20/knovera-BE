import { Router } from "express";
import {
  enrollCourse,
  getEnrollments,
  updateEnrollmentProgress,
} from "../controllers/enrollmentController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

// Get all enrollments for the current user
router.get("/", getEnrollments);

// Enroll in a course
router.post("/courses/:courseId", enrollCourse);

// Update enrollment progress
router.patch("/:enrollmentId", updateEnrollmentProgress);

export default router;
