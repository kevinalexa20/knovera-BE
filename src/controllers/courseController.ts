import { Request, Response, NextFunction } from "express";
import prisma from "../libs/prisma";
import { User } from "@supabase/supabase-js";
import { AppError } from "../middleware/errorHandler";
import slugify from "slugify";

interface RequestWithUser extends Omit<Request, "user"> {
  user?: Partial<User> & { id: string; role?: string };
}

export const createCourse = async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, description, thumbnail, price, categoryIds } = req.body;

    if (categoryIds.length !== 1) {
      return res.status(400).json({
        error: "Course must have exactly one category",
      });
    }

    const courseSlug = slugify(title, { lower: true });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        thumbnail,
        price,
        level: "BEGINNER", // or 'INTERMEDIATE', 'ADVANCED'
        status: "DRAFT", // or 'PUBLISHED', 'ARCHIVED'
        // instructor: { connect: { id: req.user.id } }, // From auth middleware
        slug: courseSlug,
        instructorId: req.user.id,
        categoryId: categoryIds[0],
      },
      include: {
        instructor: true,
        category: true,
        sections: true,
      },
    });

    res.status(201).json({ data: course });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: true,
        category: true,
        sections: {
          include: {
            lessons: true,
          },
        },
      },
    });

    res.json({ data: courses });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const getCourseBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const course = await prisma.course.findUnique({ where: { slug } });
    if (!course) {
      throw new AppError(404, "Course not found");
    }
    res.json({ data: course });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        category: true,
        sections: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json({ data: course });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "An unknown error occurred" });
    }
  }
};

export const updateCourse = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, description, price, level, status, categoryIds } = req.body;

    // Pastikan hanya instructor (atau admin) yang bisa update course
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError(404, "Course not found");
    }

    if (course.instructorId !== req.user?.id) {
      throw new AppError(403, "Not authorized to update this course");
    }

    // Jika kategori harus satu, pastikan validasi
    if (categoryIds && categoryIds.length !== 1) {
      throw new AppError(400, "Course must have exactly one category");
    }

    const updatedData: any = {
      title,
      description,
      price,
      level,
      status,
      ...(categoryIds && { categoryId: categoryIds[0] }),
    };

    // Jika title diupdate, perbarui juga slug
    if (title && title !== course.title) {
      updatedData.slug = slugify(title, { lower: true });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updatedData,
      include: {
        instructor: true,
        category: true,
        sections: true,
      },
    });

    res.json({ data: updatedCourse });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Pastikan course ada
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError(404, "Course not found");
    }

    // Cek apakah user authorized (misalnya instructor-nya)
    if (course.instructorId !== req.user?.id) {
      throw new AppError(403, "Not authorized to delete this course");
    }

    // Hapus course
    await prisma.course.delete({
      where: { id },
    });

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getLessonsByCourseSlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug, sectionId } = req.params;

    const lessons = await prisma.lesson.findMany({
      // where: {
      //   section: {
      //     id: sectionId,
      //     course: {
      //       slug,
      //     },
      //   },
      // },
      where: {
        sectionId,
        section: {
          course: {
            slug,
          },
        },
      },
      orderBy: { order: "asc" },
    });

    res.json({ data: lessons });
  } catch (error) {
    next(error);
  }
};
