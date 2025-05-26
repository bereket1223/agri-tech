import type { Request, Response, NextFunction } from "express"
import { validationResult, type ValidationChain } from "express-validator"
import { ApiError } from "../utils/error-handler"

/**
 * Middleware to validate request data
 * @param validations - Array of validation chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)))

    // Check for validation errors
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }

    // If there are errors, format them and pass to error handler
    const extractedErrors = errors.array().map((err) => {
      if ("path" in err && "msg" in err) {
        return { [err.path]: err.msg }
      }
      return { error: "Invalid field" }
    })

    next(new ApiError(400, "Validation Error", extractedErrors))
  }
}
