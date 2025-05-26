import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { connectDB } from "./config/db"
import { notFound, errorHandler } from "./utils/error-handler"
import { logger } from "./utils/logger"
import { apiLimiter } from "./middleware/rate-limit.middleware"
import userRoutes from "./routes/user.routes"


import learningRoutes from './routes/learning.routes';
import bodyParser from 'body-parser';


import uploadRoutes from "./routes/upload.routes"

import path from "path"

import analyticsRoutes from "./routes/analytics.routes"



import contactRoutes from "./routes/contact.routes"
import aiChat from "./routes/chat.route"







// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json());
app.use(helmet()) // Security headers
app.use(morgan("dev")) // HTTP request logger

// Rate limiting
app.use("/api", apiLimiter)

// Routes

app.use("/api/users", userRoutes)

app.use("/api/learning", learningRoutes)
app.use("/api/upload", uploadRoutes) 
app.use("/api", analyticsRoutes)
app.use("/api/chat", aiChat)

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));






app.use('/api/contact', contactRoutes);


// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`)
  // Close server & exit process
  process.exit(1)
})
