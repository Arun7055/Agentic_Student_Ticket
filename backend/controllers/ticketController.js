import db from "../config/db.js";
import { generateId } from "../utils/generateId.js";

export const createTicket = async (req, res) => {
  try {
    const { userId, category, description } = req.body;

    if (!userId || !category || !description) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await db.read();

    const ticket = {
      id: generateId(),
      userId,
      category,
      description,
      status: "open",
      assignedTo: null,
      createdAt: Date.now()
    };

    db.data.tickets.push(ticket);
    await db.write();

    res.json({ message: "Ticket created", ticket });
  } catch (err) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const listTickets = async (req, res) => {
  await db.read();
  res.json(db.data.tickets);
};
