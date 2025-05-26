import { Request, Response } from 'express';
import LearningTip from '../models/learning.model';

// Create a new learning tip
export const createLearningTip = async (req: Request, res: Response) => {
  try {
    const {
      title,
      content,
      image,
      videoUrl,
      pdf,
      audio,
      referenceLink,
      category
    } = req.body;

    const newTip = new LearningTip({
      title,
      content,
      image,
      videoUrl,
      pdf,
      audio,
      referenceLink,
      category
    });

    await newTip.save();
    res.status(201).json({ message: 'Learning tip created successfully', tip: newTip });
  } catch (error) {
    console.error('Error creating learning tip:', error);
    res.status(500).json({ message: 'Server error creating learning tip' });
  }
};

// Optional: Fetch all tips
export const getAllLearningTips = async (req: Request, res: Response) => {
  try {
    const tips = await LearningTip.find().sort({ createdAt: -1 });
    res.status(200).json(tips);
  } catch (error) {
    console.error('Error fetching learning tips:', error);
    res.status(500).json({ message: 'Server error fetching learning tips' });
  }
};

export const getLearningTipsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const tips = await LearningTip.find({ category });

    if (!tips || tips.length === 0) {
      return res.status(404).json({ message: 'No tips found for this category' });
    }

    res.status(200).json(tips);
  } catch (error) {
    console.error('Error fetching tips by category:', error);
    res.status(500).json({ message: 'Server error fetching tips by category' });
  }
};

// Update an existing learning tip




export const updateLearningTip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, videoUrl, referenceLink } = req.body;

    const updateData: any = {
      title,
      content,
      category,
      videoUrl,
      referenceLink,
    };

    // Handle files
    const files = req.files as { [key: string]: Express.Multer.File[] };
    if (files?.pdf?.[0]) updateData.pdf = `/uploads/${files.pdf[0].filename}`;
    if (files?.image?.[0]) updateData.image = `/uploads/${files.image[0].filename}`;
    if (files?.audio?.[0]) updateData.audio = `/uploads/${files.audio[0].filename}`;

    const updated = await LearningTip.findByIdAndUpdate(id, updateData, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Learning tip not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
  console.log('BODY:', req.body)
console.log('FILES:', req.files)

};




// Delete a learning tip
export const deleteLearningTip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedTip = await LearningTip.findByIdAndDelete(id);

    if (!deletedTip) {
      return res.status(404).json({ message: 'Learning tip not found' });
    }

    res.status(200).json({ message: 'Learning tip deleted successfully' });
  } catch (error) {
    console.error('Error deleting learning tip:', error);
    res.status(500).json({ message: 'Server error deleting learning tip' });
  }
};
