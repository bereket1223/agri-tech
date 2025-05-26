import axios from 'axios';

export interface AgricultureDataEntry {
    Nitrogen: number;
    Phosporus: number;
    Potassium: number;
    Temperature: number;
    Humidity: number;
    pH: number;
    Rainfall: number;
    createdAt: string;
}

export async function chatWithGeminiAgri(
    userInput: string,
    agricultureData: AgricultureDataEntry[]
): Promise<string> {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/chat/ai`,
            { userInput, agricultureData },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            }
        );
        return response.data.reply;
    } catch (error) {
        console.error('Error in chatWithGeminiAgri:', error);
        throw error;
    }
}