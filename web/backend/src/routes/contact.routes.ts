import express from 'express'
import { saveMessage, getMessages, deleteMessage } from '../controllers/contact.controller'

const router = express.Router()

router.post('/', saveMessage)
router.get('/', getMessages)
router.delete('/:id', deleteMessage)

export default router
