import express from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from "../controllers/user.controller"
import { protect, admin } from "../middleware/auth.middleware"

const router = express.Router()

// Public routes
router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/logout", logoutUser)

// Protected routes
router.route("/profile").get(protect, getUserProfile).put(protect, updateUserProfile)

// Admin routes
router.route("/").get(protect, admin, getUsers)

router.route("/:id").get(protect, admin, getUserById).put(protect, admin, updateUser).delete(protect, admin, deleteUser)

export default router
