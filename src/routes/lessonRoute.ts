import express from "express";
import {
  createLesson,
  getLessonById,
  getLessonBySlug,
  getLessons,
} from "../controllers/lessonController";

const router = express.Router({ mergeParams: true });

router.post("/", createLesson as express.RequestHandler);
router.get("/", getLessons as express.RequestHandler);
router.get("/:lessonId", getLessonById as express.RequestHandler);
router.get("/:slug", getLessonBySlug as express.RequestHandler);

export default router;
