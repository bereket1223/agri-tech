import { Request, Response } from "express";
import { getChatResponse } from "../services/mcp.services";


export const  chatWithAi = async(req: Request, res: Response) => {

    const { message, agroData } = req.body;
    console.log("Received message:", message, "with agroData:", agroData);
    
    const reply = await getChatResponse(message, agroData.formData);
    res.status(200).json({ reply });
}
