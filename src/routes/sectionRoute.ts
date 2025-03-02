import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createSection,
  getSectionBySlug,
  getSections,
} from "../controllers/sectionController";
import lessonRoute from "./lessonRoute";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// const router = express.Router();
const router = express.Router({ mergeParams: true });

router.use(authMiddleware); // Protect all course routes

// router.post("/:courseId/sections", createSection as express.RequestHandler);
// router.get("/:courseId/sections", getSections as express.RequestHandler);

router.post("/", createSection as express.RequestHandler);
router.get("/", getSections as express.RequestHandler);
//get all section by course slug
router.get("/", (async (req, res, next) => {
  try {
    const { slug } = req.params;
    const course = await prisma.course.findUnique({
      where: { slug },
      include: { sections: true },
    });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(200).json({ data: course.sections });
  } catch (error) {
    next(error);
  }
}) as express.RequestHandler);
//get section by slug
router.get("/:slug", getSectionBySlug as express.RequestHandler);

router.use("/:sectionId/lessons", lessonRoute);
router.use("/slug/:slug/lessons", lessonRoute);

export default router;
