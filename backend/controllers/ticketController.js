import db from "../config/db.js";
import { generateId } from "../utils/generateId.js";
import { analyzeTicket } from "../services/aiAgent.js";
import { nanoid } from "nanoid";


export async function createTicket(req, res) {
  const { email, name, description } = req.body;

  await db.read();

  // SAFETY: Ensure structure exists
  db.data ||= {};
  db.data.students ||= [];
  db.data.tickets ||= [];

  // Find existing student
  let student = db.data.students.find(s => s.email === email);

  // Register new student if not found
  if (!student) {
    student = { id: nanoid(), name, email };
    db.data.students.push(student);
  }

  // Create ticket
  const ticketId = nanoid();

  // AI ANALYSIS
  const agentResult = await analyzeTicket(description, student, ticketId);

  const newTicket = {
    id: ticketId,
    studentId: student.id,
    description,
    status: "open",
    createdAt: Date.now(),
    department: agentResult.department,
    agent: agentResult
  };

  db.data.tickets.push(newTicket);
  await db.write();

  res.json({
    message: "Ticket created",
    ticket: newTicket
  });
}


export const listTickets = async (req, res) => {
  await db.read();
  res.json(db.data.tickets);
};

export const listDeptTickets = async (req, res) => {
  const { deptId } = req.params;

  await db.read();
  db.data.tickets ||= [];

  // Only include tickets where department exists AND matches exactly
  const deptTickets = db.data.tickets.filter(ticket =>
    ticket.agent &&
    ticket.agent.department &&
    ticket.agent.department === department
  );

  res.json(deptTickets);
};




