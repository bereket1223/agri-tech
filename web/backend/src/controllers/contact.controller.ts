import { Request, Response } from 'express'
import Contact from '../models/contact.model'

// Save new contact message
export const saveMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body

    const newContact = new Contact({ name, email, subject, message })
    const savedContact = await newContact.save()

    return res.status(201).json({ success: true, data: savedContact })
  } catch (error) {
    console.error('Error saving contact:', error)
    return res.status(500).json({ success: false, message: 'Server error', error })
  }
}

// Get paginated messages
export const getMessages = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 5
  const skip = (page - 1) * limit

  try {
    const total = await Contact.countDocuments()
    const messages = await Contact.find().sort({ createdAt: -1 }).skip(skip).limit(limit)

    return res.status(200).json({
      success: true,
      data: messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' })
  }
}

// Delete a message by ID
export const deleteMessage = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const deleted = await Contact.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found' })
    }

    return res.status(200).json({ success: true, message: 'Message deleted successfully' })
  } catch (error) {
    console.error('Error deleting message:', error)
    return res.status(500).json({ success: false, message: 'Failed to delete message' })
  }
}
