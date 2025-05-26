import { Request, Response } from "express"
import User from "../models/user.model"

export const getUserRoleStats = async (req: Request, res: Response) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: "$position",
          count: { $sum: 1 },
        },
      },
    ])

    res.json(data)
  } catch (error) {
    res.status(500).json({ message: "Failed to get role stats" })
  }
}

export const getMonthlySignups = async (req: Request, res: Response) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }
    ])

    res.json(data)
  } catch (error) {
    res.status(500).json({ message: "Failed to get signup data" })
  }
}
