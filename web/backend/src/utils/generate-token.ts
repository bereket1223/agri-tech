import jwt from "jsonwebtoken"

const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables")
  }

  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "30d",
  })
}

export default generateToken
