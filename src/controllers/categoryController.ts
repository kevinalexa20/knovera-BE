import { Request, Response, NextFunction, RequestHandler } from "express";
import prisma from "../libs/prisma";
import { AppError } from "../middleware/errorHandler";

export const createCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      throw new AppError(400, "Category name is required");
    }
    const category = await prisma.category.create({
      data: { name, description },
    });
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategories: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.category.findMany();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError(404, "Category not found");
    }
    res.json({ data: category });
  } catch (error) {
    next(error);
  }
};

export const updateCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, description },
    });
    res.json({ data: updatedCategory });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
};
