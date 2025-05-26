import express from "express"
import { getUserRoleStats, getMonthlySignups } from "../controllers/analytics.controller"

const router = express.Router()

router.get("/analytics/user-roles", getUserRoleStats)
router.get("/analytics/monthly-signups", getMonthlySignups)

export default router
