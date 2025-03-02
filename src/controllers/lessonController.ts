import { NextFunction, Request, Response } from "express";
import { User } from "@supabase/supabase-js";
import prisma from "../libs/prisma";
import slugify from "slugify";

interface RequestWithUser extends Request {
  user?: User;
}

const generateUniqueSlug = async (title: string): Promise<string> => {
  let newSlug = slugify(title, { lower: true });
  let exists = await prisma.section.findUnique({ where: { slug: newSlug } });
  let counter = 1;
  while (exists) {
    newSlug = slugify(title, { lower: true }) + "-" + counter;
    exists = await prisma.section.findUnique({ where: { slug: newSlug } });
    counter++;
  }
  return newSlug;
};

export const createLesson = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, content, duration, order, type } = req.body;
    const { sectionId } = req.params;

    // Verify section exists and user is instructor
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { course: true },
    });

    if (!section || section.course.instructorId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const uniqueSlug = await generateUniqueSlug(title);

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        duration,
        order,
        type,
        slug: uniqueSlug,
        isPublished: false,
        sectionId,
      },
    });

    res.status(201).json({ data: lesson });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const getLessons = async (req: Request, res: Response) => {
  try {
    const { sectionId } = req.params;

    const lessons = await prisma.lesson.findMany({
      where: { sectionId },
      orderBy: { order: "asc" },
    });

    res.json({ data: lessons });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
export const getLessonBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { slug } });
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    res.json({ data: lesson });
  } catch (error) {
    next(error);
  }
};

// export const getLessonById = async (req: Request, res: Response) => {

// }

export const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lessonId } = req.params;
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    res.json({ data: lesson });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const updateLessonProgress = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const { lessonId } = req.params;
    const { completed, watchTime } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Upsert progress record
    const progress = await prisma.lessonProgress.upsert({
      where: {
        lessonId_userId: { lessonId, userId },
      },
      update: {
        completed,
        watchTime: { increment: watchTime },
      },
      create: {
        lessonId,
        userId,
        completed,
        watchTime,
      },
    });

    let progressPercentage = 0;

    // Ambil data lesson beserta course-nya untuk menghitung progress course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (lesson && lesson.section && lesson.section.course) {
      const courseId = lesson.section.course.id;
      const totalLessons = await prisma.lesson.count({
        where: { section: { courseId } },
      });

      // Hindari pembagian nol
      if (totalLessons > 0) {
        const completedLessons = await prisma.lessonProgress.count({
          where: {
            userId,
            completed: true,
            lesson: {
              section: { courseId },
            },
          },
        });
        progressPercentage = (completedLessons / totalLessons) * 100;

        // Update progress di enrollment
        await prisma.enrollment.updateMany({
          where: {
            courseId,
            studentId: userId,
          },
          data: {
            progress: progressPercentage,
            status: progressPercentage === 100 ? "COMPLETED" : "ACTIVE",
            completedAt: progressPercentage === 100 ? new Date() : null,
          },
        });
      }
    }
    res.json({ data: { progress, courseProgress: progressPercentage } });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
