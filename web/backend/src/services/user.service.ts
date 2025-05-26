import User, { IUser } from "../models/user.model"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
  organization?: string
  position?: string
  isAdmin?: boolean
}

interface LoginInput {
  email: string
  password: string
}

interface LoginOutput {
  user: Omit<IUser, "password" | "__v"> & { id: string }
  token: string
}

export const createUser = async ({
  firstName,
  lastName,
  email,
  password,
  organization = "",
  position = "",
  isAdmin = false,
}: CreateUserInput): Promise<IUser> => {
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    organization,
    position,
    isAdmin,
  })

  return await newUser.save()
}

export const loginUser = async ({
  email,
  password,
}: LoginInput): Promise<LoginOutput> => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error("Invalid email or password")
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error("Invalid email or password")
  }

  user.lastLogin = new Date()
  await user.save()

  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" },
  )

  const userData = {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    organization: user.organization,
    position: user.position,
    isAdmin: user.isAdmin,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }

  return { user: userData, token }
}

export const getAllUsers = async (): Promise<Omit<IUser, "password">[]> => {
  const users = await User.find().select("-password").exec()
  return users
}

export const getUserById = async (
  userId: string,
): Promise<Omit<IUser, "password">> => {
  try {
    const user = await User.findById(userId).select("-password").exec()
    if (!user) {
      throw new Error("User not found")
    }
    return user
  } catch (error: any) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      throw new Error("Invalid user ID format")
    }
    throw error
  }
}

export const updateUserProfile = async (
  userId: string,
  updateData: Partial<
    Omit<IUser, "password" | "createdAt" | "updatedAt"> & { password?: string }
  >,
): Promise<Omit<IUser, "password">> => {
  if (updateData.email) {
    const existingUser = await User.findOne({
      email: updateData.email,
      _id: { $ne: userId },
    }).exec()

    if (existingUser) {
      throw new Error("Email is already in use")
    }
  }

  if (updateData.password) {
    const salt = await bcrypt.genSalt(10)
    updateData.password = await bcrypt.hash(updateData.password, salt)
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true },
  )
    .select("-password")
    .exec()

  if (!updatedUser) {
    throw new Error("User not found")
  }

  return updatedUser
}

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId).exec()
    if (!user) {
      throw new Error("User not found")
    }

    const result = await User.findByIdAndDelete(userId).exec()
    if (!result) {
      throw new Error("User not found")
    }

    return true
  } catch (error: any) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      throw new Error("Invalid user ID format")
    }
    throw error
  }
}

export const updateUserAdminStatus = async (
  userId: string,
  isAdmin: boolean,
): Promise<Omit<IUser, "password">> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isAdmin } },
      { new: true },
    )
      .select("-password")
      .exec()

    if (!updatedUser) {
      throw new Error("User not found")
    }

    return updatedUser
  } catch (error: any) {
    if (error.name === "CastError" && error.kind === "ObjectId") {
      throw new Error("Invalid user ID format")
    }
    throw error
  }
}
