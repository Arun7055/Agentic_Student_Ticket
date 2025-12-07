import db from "../config/db.js";
import { nanoid } from "nanoid";
import { analyzeTicket } from "../services/aiAgent.js";
import { sendToHostelStart, sendToHostelReply } from "../services/aiAgent.js";
import {sendToLibraryStart,sendToLibraryReply} from "../services/aiAgent.js"
import { sendToExamCellStart, sendToExamCellReply } from "../services/aiAgent.js";
import {sendToDeanStart,sendToDeanReply} from "../services/aiAgent.js"
import { sendToFeesStart, sendToFeesReply } from "../services/aiAgent.js";
import {sendToAdminStart,sendToAdminReply} from "../services/aiAgent.js"
import {sendToPlacementStart,sendToPlacementReply} from "../services/aiAgent.js"

// ===========================
// CREATE TICKET
// ===========================
export async function createTicket(req, res) {
  const { email, name, description } = req.body;

  if (!email || !name || !description) {
    return res.status(400).json({
      message: "Name, email, and description are required",
    });
  }

  await db.read();

  db.data.students ||= [];
  db.data.tickets ||= [];
  db.data.departments ||= [];

  // Find or create student
  let student = db.data.students.find(s => s.email === email);
  if (!student) {
    student = {
      id: nanoid(),
      name,
      email,
    };
    db.data.students.push(student);
  }

  const ticketId = nanoid();

  // AI analyzer
  const agentResult = await analyzeTicket(description, student, ticketId);

  // Find mapped department
  const dept = db.data.departments.find(
    d => d.name.toLowerCase() === agentResult.department.toLowerCase()
  );

  if (!dept) {
    return res.status(500).json({
      message: "AI returned invalid department",
      aiOutput: agentResult,
    });
  }

  const newTicket = {
    id: ticketId,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    description,
    status: "open",
    createdAt: Date.now(),
    departmentId: dept.id,
    departmentName: dept.name,
    agent: agentResult,
  };

  db.data.tickets.push(newTicket);
  await db.write();

  res.json({
    message: "Ticket created",
    ticket: newTicket,
  });

  // ============================
  // Send to Python AI (background)
  // Only for hostel department
  // ============================
  console.log(dept.name.toLowerCase() );
  const deptName = dept.name.toLowerCase();
  // ========================================================
// HOSTEL OFFICE
// ========================================================
if (deptName === "hostel office") {
  console.log("Forwarding ticket to Hostel AI chatbot...");

  sendToHostelStart(newTicket).catch(err => {
    console.error("Hostel AI error:", err.message);
  });
}

// ========================================================
// LIBRARY
// ========================================================
if (deptName === "library") {
  console.log("Forwarding ticket to Library AI chatbot...");

  sendToLibraryStart(newTicket).catch(err => {
    console.error("Library AI error:", err.message);
  });
}

// ========================================================
// EXAM CELL
// ========================================================
if (deptName === "exam cell") {
  console.log("Forwarding ticket to Exam Cell AI chatbot...");

  sendToExamCellStart(newTicket).catch(err => {
    console.error("Exam Cell AI error:", err.message);
  });
}

// ========================================================
// ACADEMIC AFFAIRS / DEAN
// ========================================================
if (deptName === "academic affairs" || deptName === "dean") {
  console.log("Forwarding ticket to Academic/Dean AI chatbot...");

  sendToDeanStart(newTicket).catch(err => {
    console.error("Dean AI error:", err.message);
  });
}

// ========================================================
// FEE OFFICE
// ========================================================
if (deptName === "fee office") {
  console.log("Forwarding ticket to Fee Office AI chatbot...");

  sendToFeesStart(newTicket).catch(err => {
    console.error("Fee Office AI error:", err.message);
  });
}

// ========================================================
// ADMIN OFFICE
// ========================================================
if (deptName === "admin office") {
  console.log("Forwarding ticket to Admin Office AI chatbot...");

  sendToAdminStart(newTicket).catch(err => {
    console.error("Admin Office AI error:", err.message);
  });
}

// ========================================================
// PLACEMENT CELL
// ========================================================
if (deptName === "placement cell") {
  console.log("Forwarding ticket to Placement Cell AI chatbot...");

  sendToPlacementStart(newTicket).catch(err => {
    console.error("Placement Cell AI error:", err.message);
  });
}

  
  
}


// ============================
// LIST STUDENT TICKETS
// ============================
export const listTickets = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ error: "Student email is required" });
  }

  await db.read();

  const tickets = (db.data.tickets || []).filter(
    t => t.studentEmail?.toLowerCase() === email.toLowerCase()
  );

  res.json(tickets);
  
};


// ============================
// LIST TICKETS BY DEPARTMENT
// ============================
export const listDeptTickets = async (req, res) => {
  const { deptId } = req.params;

  if (!deptId) {
    return res.status(400).json({ error: "Department ID is required" });
  }

  await db.read();

  const deptTickets = (db.data.tickets || []).filter(
    t => (t.departmentId || "").toLowerCase() === deptId.toLowerCase()
  );

  res.json(deptTickets);
};
