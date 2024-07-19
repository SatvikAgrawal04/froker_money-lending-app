import { Router } from "express";
import {
  signup,
  login,
  getUserData,
  borrowMoney,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// Signup endpoint
router.route("/signup").post(signup);

// Login endpoint
router.route("/login").post(login);

// GET USER DATA
router.route("/user").get(authMiddleware, getUserData);

// BORROW MONEY
router.route("/borrow").post(authMiddleware, borrowMoney);

export default router;
