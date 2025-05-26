import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User, { type IUserDocument } from "../models/user.model"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument
    }
  }
}

interface JwtPayload {
  id: string
}

// Protect routes - verify token
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]

      if (!token) {
        res.status(401).json({ message: "Not authorized, no token" })
        return
      }

      // Verify token
      const jwtSecret = process.env.JWT_SECRET

      if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in environment variables")
      }

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select("-password")

      if (!req.user) {
        res.status(401).json({ message: "Not authorized, user not found" })
        return
      }

      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: "Not authorized, token failed" })
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" })
  }
}

// Admin middleware
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as an admin" })
  }
}
