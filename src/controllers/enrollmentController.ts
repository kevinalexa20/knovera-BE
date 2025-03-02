import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../libs/prisma";
import { AppError } from "../middleware/errorHandler";
import { User } from "@supabase/supabase-js";
// import { User } from "@prisma/client";

export interface RequestWithUser extends Omit<Request, "user"> {
  user?: Partial<User> & { id: string; role?: string };
}

export const enrollCourse: RequestHandler<
  { courseId: string },
  any,
  any
> = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, "Unauthorized");

    //to check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new AppError(404, "Course not found");

    //to check if user already enrolled in the course
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: { courseId, studentId: userId },
    });
    if (existingEnrollment) {
      res.status(200).json({ data: existingEnrollment });
      return;
    }

    //create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        courseId,
        studentId: userId,
        // progress: 0,
        status: "ACTIVE",
      },
    });

    res.status(201).json({ data: enrollment });
  } catch (error) {
    next(error);
  }
};

export const getEnrollments = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "Unauthorized to access this resource");
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: true,
        // {
        //   include: {
        //     instructor: true,
        //     category: true,
        //   },
        // },
      },
    });

    res.json({ data: enrollments });
  } catch (error) {
    next(error);
  }
};

export const updateEnrollmentProgress = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const { enrollmentId } = req.params;
    const { progress } = req.body;
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    // Perbarui progress enrollment, pastikan enrollment milik user
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        id: enrollmentId,
        studentId: userId,
      },
    });
    if (!enrollment) {
      throw new AppError(404, "Enrollment not found");
    }
    if (enrollment.studentId !== userId) {
      throw new AppError(403, "Not authorized to update this enrollment");
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: progress,
        status: progress === 100 ? "COMPLETED" : "ACTIVE",
        completedAt: progress === 100 ? new Date() : null,
      },
    });

    res.json({ data: updatedEnrollment });
  } catch (error) {
    next(error);
  }
};
