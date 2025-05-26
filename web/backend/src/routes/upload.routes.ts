import express from "express"
import multer from "multer"
import path from "path"
import fs from "fs"
import {
  createLearningTip,
  getAllLearningTips,
  getLearningTipsByCategory,
  updateLearningTip,
  deleteLearningTip
} from "../controllers/learning.controller"

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads")
    fs.mkdirSync(uploadPath, { recursive: true })
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  }
})

const upload = multer({ storage }) 

// Learning Tip Routes
router.post('/learning', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), createLearningTip)

router.get('/learning', getAllLearningTips)
router.get('/learning/category/:category', getLearningTipsByCategory)

router.put('/learning/:id', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), updateLearningTip)

router.delete('/learning/:id', deleteLearningTip)

// Handle dynamic type uploads
router.post("/:type", (req, res, next) => {
  const type = req.params.type
  const uploadField = upload.single(type)

  uploadField(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err)
      return res.status(500).json({ success: false, message: "File upload failed" })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" })
    }

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    return res.status(200).json({ success: true, url: fileUrl })
  })
})

export default router
