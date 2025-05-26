import express from 'express';
import {
  createLearningTip,
  getAllLearningTips,
  getLearningTipsByCategory,
  updateLearningTip,
  deleteLearningTip
} from '../controllers/learning.controller';
import { upload } from '../middleware/upload';

const router = express.Router();

router.post('/learning', createLearningTip);
router.get('/learning', getAllLearningTips);
router.get('/learning/:category', getLearningTipsByCategory);
 
router.delete('/learning/:id', deleteLearningTip);

export default router;
router.put(
  '/:id',
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  updateLearningTip
);
