import db from "../config/db.js";
import { nanoid } from "nanoid";
import { analyzeTicket } from "../services/aiAgent.js";


// ============================
// CREATE TICKET
// ============================
export async function createTicket(req, res) {
  const { email, name, description } = req.body;

  if (!email || !name || !description) {
    return res.status(400).json({
      message: "Name, email, and description are required"
    });
  }

  await db.read();

  db.data.students ||= [];
  db.data.tickets ||= [];
  db.data.departments ||= [];

  // find student
  let student = db.data.students.find(s => s.email === email);

  if (!student) {
    student = { id: nanoid(), name, email };
    db.data.students.push(student);
  }

  const ticketId = nanoid();

  const agentResult = await analyzeTicket(description, student, ticketId);

  // find dept mapping
  const dept = db.data.departments.find(
    d => d.name.toLowerCase() === agentResult.department.toLowerCase()
  );

  if (!dept) {
    return res.status(500).json({
      message: "AI returned invalid department",
      aiOutput: agentResult
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
    agent: agentResult
  };

  db.data.tickets.push(newTicket);
  await db.write();

  res.json({
    message: "Ticket created",
    ticket: newTicket
  });
}

// ============================
// LIST ALL TICKETS (with filters)
// ============================
export const listTickets = async (req, res) => {
  const { email } = req.params; // Use URL parameter instead of query

  if (!email) {
    return res.status(400).json({ error: "Student email is required" });
  }

  await db.read();
  let tickets = db.data.tickets || [];

  // Filter by student email
  tickets = tickets.filter(t =>
    t.studentEmail?.toLowerCase() === email.toLowerCase()
  );

  res.json(tickets);
};


// ============================
// LIST TICKETS BY DEPARTMENT (URL param version)
// ============================
export const listDeptTickets = async (req, res) => {
  const { deptId } = req.params;

  // Validate deptId
  if (!deptId) {
    return res.status(400).json({ error: "Department ID is required" });
  }

  await db.read();
  db.data.tickets ||= [];

  const deptTickets = db.data.tickets.filter(ticket =>
    (ticket.departmentId || "").toLowerCase() === deptId.toLowerCase()
  );

  res.json(deptTickets);
};


