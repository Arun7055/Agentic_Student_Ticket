// /services/aiAgent.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a model instance
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash"
});

console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY?.length);


export async function analyzeTicket(description, student, ticketId) {
  try {
    const prompt = `
A help desk ticket was created in the college system.
Here are the details:

Ticket ID: ${ticketId}
Student Name: ${student.name}
Student Email: ${student.email}

Ticket Description:
"${description}"

Your task:
1. Find what department or faculty should handle this issue.
2. Summarize the problem politely.
3. Identify urgency level (low / medium / high).
4. Suggest next action for staff.

Give output in this JSON structure exactly:

{
  "department": "",
  "urgency": "",
  "summary": "",
  "action": ""
}
`;

    const result = await model.generateContent(prompt);

    // Gemini returns text form, convert JSON safely
    const rawText = result.response.text();
    const parsed = JSON.parse(rawText);

    return parsed;

  } catch (err) {
    console.error("Gemini Error:", err);
    return {
      department: "unknown",
      urgency: "low",
      summary: "Could not analyze ticket",
      action: "Manual review required"
    };
  }
}
