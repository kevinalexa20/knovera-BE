// userRoute.ts
import { Router } from "express";
import { getUserProfile } from "../controllers/userController";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.get('/profile', authMiddleware, getUserProfile);

export default router;
