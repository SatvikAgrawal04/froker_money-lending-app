import { Router } from "express";
import { signup, login } from "../controllers/user.controller.js";

const router = Router();

// Signup endpoint
router.route("/signup").post(signup);

// Login endpoint
router.route("/login").post(login);

export default router;
