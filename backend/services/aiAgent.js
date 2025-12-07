// /services/aiAgent.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PY_HOSTEL_URL = "http://127.0.0.1:5001";

// Load Gemini Key from ENV if available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;



// Initialize model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

console.log("Loaded Gemini Key:", GEMINI_API_KEY?.length);

function cleanAIJSON(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

// ------------------------------------------------------------
// ANALYZE TICKET
// ------------------------------------------------------------
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

Respond ONLY with JSON:

{
  "department": "",
  "urgency": "",
  "summary": "",
  "action": ""
}
`;

    const result = await model.generateContent(prompt);

    const raw = result.response.text();
    const cleaned = cleanAIJSON(raw);

    let json;
    try {
      json = JSON.parse(cleaned);
    } catch (err) {
      console.log("❌ Invalid AI JSON → ", cleaned);
      json = {
        department: "unknown",
        urgency: "low",
        summary: "AI returned invalid JSON",
        action: "Manual review required"
      };
    }
    return json;

  } catch (error) {
    console.error("❌ Gemini Error:", error);

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
  const res = await axios.post(`${PY_HOSTEL_URL}/examcell/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });
  console.log("Exam Cell Start Response →", res.data);
  return res.data;
}

export async function sendToExamCellReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/examcell/reply`, {
    ticketId,
    message
  });
  return res.data;
}


//------------------------------------------------------------
// DEAN / ACADEMIC AFFAIRS
//------------------------------------------------------------
export async function sendToDeanStart(ticket) {
  const res = await axios.post(`${PY_HOSTEL_URL}/dean/start`, {
    ticketId: ticket.id,
    description: ticket.description
  });
  console.log("Dean Start Response →", res.data);
  return res.data;
}

export async function sendToDeanReply({ ticketId, message }) {
  const res = await axios.post(`${PY_HOSTEL_URL}/dean/reply`, {
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


//------------------------------------------------------------
// ADMIN OFFICE
//------------------------------------------------------------
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
