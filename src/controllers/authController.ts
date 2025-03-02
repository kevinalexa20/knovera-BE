import { Request, Response } from "express";
import supabase from "../libs/supabase";
import prisma from "../libs/prisma";
import { formatResponse } from "../utils/responseFormatter";
import { User } from "@supabase/supabase-js";

interface AuthenticatedRequest extends Request {
  user?: User;
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Register with Supabase Auth
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        id: user?.id as string,
        email,
        firstName,
        lastName,
        role: "STUDENT",
      },
    });

    res.json(formatResponse(true, "Registration successful", newUser));
  } catch (error: any) {
    console.log("supabase error", error);
    res.status(400).json(formatResponse(false, error.message));
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    res.json(formatResponse(true, "Login successful", data));
  } catch (error: any) {
    res.status(401).json(formatResponse(false, error.message));
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Invalidate Supabase session
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // 2. Update last activity time
    if (req.user?.id) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { lastActivityTime: new Date() },
      });
    }

    // 3. Clear session from response
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.json(formatResponse(true, "Logout successful"));
  } catch (error: any) {
    res.status(400).json(formatResponse(false, error.message));
  }
};
