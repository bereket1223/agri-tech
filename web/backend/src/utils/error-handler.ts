/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number
  errors?: any[]
  stack?: string
  success = false

  constructor(statusCode: number, message: string, errors?: any[], stack?: string) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * Not Found error generator
 */
export const notFound = (req: any, res: any, next: any) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`)
  next(error)
}

/**
 * Global error handler
 */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal Server Error"

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
}
