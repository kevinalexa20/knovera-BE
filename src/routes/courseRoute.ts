import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseBySlug,
  getLessonsByCourseSlug,
} from "../controllers/courseController";
import sectionRoute from "./sectionRoute";

const router = express.Router({ mergeParams: true });

router.use(authMiddleware); // Protect all course routes

router.post("/", createCourse as express.RequestHandler);
router.get("/", getCourses as express.RequestHandler);
router.get("/:id", getCourseById as express.RequestHandler);
router.put("/:id", updateCourse); // Update course
router.delete("/:id", deleteCourse); // Delete course
router.get("/slug/:slug", getCourseBySlug);
// router.get("/:slug/sections/:sectionId/lessons", getLessonsByCourseSlug);
// router.get('/:id', getCourseById);
// router.put('/:id', updateCourse);
// router.delete('/:id', deleteCourse);

router.use("/:courseId/sections", sectionRoute);
router.use("/slug/:slug/sections", sectionRoute);

export default router;
