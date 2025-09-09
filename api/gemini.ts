import { GoogleGenAI } from "@google/genai";

// The API key is read from process.env.API_KEY, which is assumed to be set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEnhancedDescription = async (title: string, userInput: string): Promise<string> => {
    const prompt = `
        Act as a creative copywriter for an innovation and arts festival called "Zeppel Inn".
        Your task is to take a project title and a simple user-provided description and transform it into a more engaging, compelling, and slightly more detailed summary for a public showcase card.
        The tone should be inspiring, professional, and highlight the intersection of technology, art, and community. Keep it concise, around 2-3 sentences.
        The language must be Swedish.

        Project Title: "${title}"
        User's Description: "${userInput}"

        Generate the new description now.
    `;

    if (!process.env.API_KEY) {
        // This check is inside the function to provide a clear error upon invocation.
        throw new Error("API_KEY is not set.");
    }
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        const text = response.text;
        if (!text) {
            throw new Error("Received an empty response from the API.");
        }
        return text.trim();

    } catch (error) {
        console.error("Error generating description with Gemini API:", error);
        // Re-throw the error to be handled by the calling function's try-catch block.
        throw error;
    }
};
