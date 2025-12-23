// /services/aiAgent.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import dotenv from "dotenv";
import OpenAI from "openai";
import Groq from "groq-sdk";
dotenv.config();

const PY_HOSTEL_URL = "http://127.0.0.1:5001";

// Load Gemini Key from ENV if available
//const GEMINI_API_KEY = process.env.GEMINI_API_KEY;



// Initialize model
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash"
// });


// const client = new OpenAI({
//   apiKey: process.env.GROK_API_KEY,
//   baseURL: "https://api.x.ai/v1"
// });

// console.log("Loaded Grok Key:", process.env.GROK_API_KEY?.length);

// export async function callAI(prompt) {
//   const response = await client.chat.completions.create({
//     model: "grok-2",
//     messages: [
//       { role: "user", content: prompt }
//     ]
//   });

//   return response.choices[0].message.content;
// }

// // console.log("Loaded Gemini Key:", GEMINI_API_KEY?.length);

// function cleanAIJSON(text) {
//   return text
//     .replace(/```json/g, "")
//     .replace(/```/g, "")
//     .trim();
// }




const client = new Groq({
  apiKey: process.env.GROQ_API_KEY // must be a valid Groq API key
});

const response = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile", // current Groq model
  messages: [{ role: "user", content: "Hello!" }]
});

console.log(response.choices[0].message.content);

// ------------------------------------------------------------
// ANALYZE TICKET
// ------------------------------------------------------------
// export async function analyzeTicket(description, student, ticketId) {
//   try {
//     const prompt = `
// A help desk ticket has been created.

// Ticket ID: ${ticketId}
// Student Name: ${student.name}
// Student Email: ${student.email}

// Description:
// "${description}"

// Your tasks:
// 1. Identify the correct department.
// 2. Summarize the issue.
// 3. Urgency (low / medium / high).
// 4. Action staff should take.

// Choose ONE department:
// - Admin Office
// - Fee Office
// - Academic Affairs
// - Library
// - Exam Cell
// - Hostel Office
// - Placement Cell

// Respond ONLY with JSON:

// {
//   "department": "",
//   "urgency": "",
//   "summary": "",
//   "action": ""
// }
// `;

//     const result = await model.generateContent(prompt);

//     const raw = result.response.text();
//     const cleaned = cleanAIJSON(raw);

//     let json;
//     try {
//       json = JSON.parse(cleaned);
//     } catch (err) {
//       console.log("❌ Invalid AI JSON → ", cleaned);
//       json = {
//         department: "unknown",
//         urgency: "low",
//         summary: "AI returned invalid JSON",
//         action: "Manual review required"
//       };
//     }
//     return json;

//   } catch (error) {
//     console.error("❌ Gemini Error:", error);

//     return {
//       department: "unknown",
//       urgency: "low",
//       summary: "AI processing failure",
//       action: "Manual review required"
//     };
//   }
// }


export async function analyzeTicket(description, student, ticketId) {
  try {
    const prompt = `
A help desk ticket has been created.

Ticket ID: ${ticketId}
Student Name: ${student.name}
Student Email: ${student.email}

Description:
"${description}"

Your tasks:
1. Identify the correct department.
2. Summarize the issue.
3. Urgency (low / medium / high).
4. Action staff should take.

Choose ONE department:
- Admin Office
- Fee Office
- Academic Affairs
- Library
- Exam Cell
- Hostel Office
- Placement Cell
issue of marks cards is done by admin

Respond ONLY with JSON:

{
  "department": "",
  "urgency": "",
  "summary": "",
  "action": ""
}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Groq LLM
      messages: [
        { role: "system", content: "You are a strict JSON-only assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 512
    });

    const raw = completion.choices[0].message.content;

    let json;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.error("❌ Invalid Groq JSON →", raw);
      json = {
        department: "unknown",
        urgency: "low",
        summary: "AI returned invalid JSON",
        action: "Manual review required"
      };
    }

    return json;

  } catch (error) {
    console.error("❌ Groq Error:", error);

    return {
      department: "unknown",
      urgency: "low",
      summary: "AI processing failure",
      action: "Manual review required"
    };
  }
}

// ------------------------------------------------------------
// HOSTEL WORKFLOW FUNCTIONS
// ------------------------------------------------------------
export async function sendToHostelStart(ticket) {
  const res = await axios.post(`${PY_HOSTEL_URL}/hostel/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });

  console.log("Hostel Start Response →", res.data);
  return res.data;
}

export async function sendToHostelReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/hostel/reply`, {
    ticketId,
    message
  });

  return res.data;
}
// 📌 Send the first message to Python Library AI server
export async function sendToLibraryStart(ticket) {
  const res = await axios.post(`${PY_HOSTEL_URL}/library/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });

  console.log("Library Start Response →", res.data);
  return res.data;
}

// 📌 Send user reply to Library AI conversation
export async function sendToLibraryReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/library/reply`, {
    ticketId,
    message
  });

  return res.data;
}

//------------------------------------------------------------
// PLACEMENT CELL
//------------------------------------------------------------
export async function sendToPlacementStart(ticket) {
  const res = await axios.post(`${PY_HOSTEL_URL}/placement/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });
  console.log("Placement Start Response →", res.data);
  return res.data;
}

export async function sendToPlacementReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/placement/reply`, {
    ticketId,
    message
  });
  return res.data;
}


//------------------------------------------------------------
// EXAM CELL
//------------------------------------------------------------
export async function sendToExamCellStart(ticket) {
  const res = await axios.post(`${PY_HOSTEL_URL}/exam/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });
  console.log("Exam Cell Start Response →", res.data);
  return res.data;
}

export async function sendToExamCellReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/exam/reply`, {
    ticketId,
    message
  });
  return res.data;
}


//------------------------------------------------------------
// DEAN / ACADEMIC AFFAIRS
//------------------------------------------------------------
export async function sendToDeanStart(ticket) {
  const res = await axios.post(`${PY_HOSTEL_URL}/academic/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });
  console.log("Dean Start Response →", res.data);
  return res.data;
}

export async function sendToDeanReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/academic/reply`, {
    ticketId,
    message
  });
  return res.data;
}


//------------------------------------------------------------
// FEES OFFICE
//------------------------------------------------------------
export async function sendToFeesStart(ticket) {
  const res = await axios.post(`${PY_HOSTEL_URL}/fees/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });
  console.log("Fees Start Response →", res.data);
  return res.data;
}

export async function sendToFeesReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/fees/reply`, {
    ticketId,
    message
  });
  return res.data;
}

export async function sendToAdminStart(ticket) {
  const res = await axios.post(`${PY_HOSTEL_URL}/admin/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });
  console.log("Admin Start Response →", res.data);
  return res.data;
}

export async function sendToAdminReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/admin/reply`, {
    ticketId,
    message
  });
  return res.data;
}
