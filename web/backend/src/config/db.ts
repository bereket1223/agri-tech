import mongoose from "mongoose"
import { logger } from "../utils/logger"

/**
 * Connect to MongoDB database
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string)
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`)
    } else {
      logger.error("Unknown error occurred while connecting to MongoDB")
    }
    process.exit(1)
  }
}
