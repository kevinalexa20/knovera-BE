import { NextFunction, Request, Response } from "express";
import { User } from "@supabase/supabase-js";
import prisma from "../libs/prisma";
import slugify from "slugify";
import { AppError } from "../middleware/errorHandler";

interface RequestWithUser extends Request {
  user?: User;
}

// Fungsi untuk memastikan slug unik
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

export const createSection = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, order } = req.body;
    const { courseId } = req.params;

    // Verify course exists and user is instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.instructorId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to modify this course" });
    }

    const uniqueSlug = await generateUniqueSlug(title);

    const section = await prisma.section.create({
      data: {
        title,
        order,
        courseId,
        slug: uniqueSlug,
      },
      include: {
        lessons: true,
      },
    });

    res.status(201).json({ data: section });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

// export const getSections = async (req: Request, res: Response) => {
//   try {
//     const { courseId } = req.params;

//     const sections = await prisma.section.findMany({
//       where: { courseId },
//       include: {
//         lessons: true,
//       },
//       orderBy: {
//         order: "asc",
//       },
//     });

//     res.json({ data: sections });
//   } catch (error) {
//     if (error instanceof Error) {
//       res.status(400).json({ error: error.message });
//     } else {
//       res.status(500).json({ error: "An unknown error occurred" });
//     }
//   }
// };

export const getSections = async (req: Request, res: Response) => {
  try {
    // Prefer courseId from params if available, else use slug to lookup course
    let courseId = req.params.courseId;
    if (!courseId && req.params.slug) {
      const course = await prisma.course.findUnique({
        where: { slug: req.params.slug },
      });
      if (course) {
        courseId = course.id;
      }
    }
    if (!courseId) {
      return res.status(400).json({ error: "Course identifier missing" });
    }

    const sections = await prisma.section.findMany({
      where: { courseId },
      include: { lessons: true },
      orderBy: { order: "asc" },
    });

    res.json({ data: sections });
  } catch (error) {
    res.status(500).json({ error: "An unknown error occurred" });
  }
};

//get section by slug
export const getSectionBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const section = await prisma.section.findUnique({
      where: { slug },
      include: { lessons: true },
    });
    if (!section) {
      throw new AppError(404, "Section not found");
    }
    return res.status(200).json({ data: section });
  } catch (error) {
    next(error);
  }
};
