// userController.ts
import { Request, Response } from "express";
import prisma from "../libs/prisma";
import { formatResponse } from "../utils/responseFormatter";
import { User } from "@supabase/supabase-js";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json(formatResponse(false, "Unauthorized"));
      return;
    }
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json(formatResponse(false, "User not found"));
      return;
    }

    res.json(formatResponse(true, "Profile fetched successfully", user));
  } catch (error: any) {
    res.status(400).json(formatResponse(false, error.message));
  }
};
