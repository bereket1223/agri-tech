import { Router } from "express";
import { chatWithAi } from "../controllers/chat.controller";

const router = Router();


router.post('/ai', chatWithAi)

export default  router;