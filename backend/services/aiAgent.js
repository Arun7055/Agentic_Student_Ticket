// /services/aiAgent.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a model instance
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

console.log("Loaded Gemini Key:", process.env.GEMINI_API_KEY?.length);

function cleanAIJSON(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}


export async function analyzeTicket(description, student, ticketId) {
  try {
    const prompt = `
A help desk ticket was created in the college support system.

Ticket ID: ${ticketId}
Student Name: ${student.name}
Student Email: ${student.email}

Ticket Description:
"${description}"

Your task:
1. Identify which department should handle this.
2. Summarize the issue.
3. Give urgency (low / medium / high).
4. Suggest what the staff should do next.

Respond **ONLY** with JSON in this exact format:

{
  "department": "",
  "urgency": "",
  "summary": "",
  "action": ""
}
`;

    const result = await model.generateContent(prompt);

    let rawText = result.response.text();
    let cleaned = cleanAIJSON(rawText);

    // Try parsing
    let json;

    try {
      json = JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse fail → returning fallback:\n", cleaned);
      json = {
        department: "unknown",
        urgency: "low",
        summary: "AI response was not valid JSON",
        action: "Manual review required"
      };
    }

    return json;

  } catch (err) {
    console.error("Gemini Error:", err);
    return {
      department: "unknown",
      urgency: "low",
      summary: "AI processing failure",
      action: "Manual review required"
    };
  }
}
