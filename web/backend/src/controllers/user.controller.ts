import type { Request, Response } from "express"
import User from "../models/user.model"
import generateToken from "../utils/generate-token"

interface RegisterUserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  organization?: string
  position?: string
}

interface LoginUserRequest {
  email: string
  password: string
}

interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  organization?: string
  position?: string
  isAdmin?: boolean
}

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, organization, position } = req.body as RegisterUserRequest

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      res.status(400).json({ message: "User already exists" })
      return
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      organization,
      position,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        message: "User registered successfully.",
      })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginUserRequest

    // Find user by email
    const user = await User.findOne({ email })

    // Check if user exists and password matches
    if (user && (await user.comparePassword(password))) {
      // Generate JWT token
      const token = generateToken(user._id.toString())

      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token,
      })
    } else {
      res.status(401).json({ message: "Invalid email or password" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a stateless JWT authentication system, the server doesn't need to do anything
    // The client is responsible for removing the token
    // However, we can implement token blacklisting if needed in the future

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" })
      return
    }

    const user = await User.findById(req.user._id)

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        organization: user.organization,
        position: user.position,
        isAdmin: user.isAdmin,
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" })
      return
    }

    const user = await User.findById(req.user._id)

    if (user) {
      const { firstName, lastName, email, password, organization, position } = req.body as UpdateUserRequest

      user.firstName = firstName || user.firstName
      user.lastName = lastName || user.lastName
      user.email = email || user.email
      user.organization = organization || user.organization
      user.position = position || user.position

      if (password) {
        user.password = password
      }

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        organization: updatedUser.organization,
        position: updatedUser.position,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id.toString()),
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}).select("-password")
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      await user.deleteOne()
      res.json({ message: "User removed" })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      const { firstName, lastName, email, organization, position, isAdmin } = req.body as UpdateUserRequest

      user.firstName = firstName || user.firstName
      user.lastName = lastName || user.lastName
      user.email = email || user.email
      user.organization = organization || user.organization
      user.position = position || user.position
      user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        organization: updatedUser.organization,
        position: updatedUser.position,
        isAdmin: updatedUser.isAdmin,
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error", error: (error as Error).message })
  }
}
