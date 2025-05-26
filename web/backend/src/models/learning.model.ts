import mongoose from 'mongoose';

const LearningTipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  image: {
    type: String, // Image URL
  },
  videoUrl: {
    type: String, // YouTube video URL
  },
  pdf: {
    type: String, // PDF file URL
  },
  audio: {
    type: String, // Audio file URL
  },
  referenceLink: {
    type: String, // External reference
  },
  category: {
    type: String,
    required: true,
  }
}, { timestamps: true });

const LearningTip = mongoose.models.LearningTip || mongoose.model("LearningTip", LearningTipSchema);
export default LearningTip;
