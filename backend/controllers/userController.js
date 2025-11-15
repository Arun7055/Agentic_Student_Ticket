import db from "../config/db.js";
import { generateId } from "../utils/generateId.js";

export const registerUser = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ message: "Name and email required" });
    }

    await db.read();

    const exists = db.data.users.find(u => u.email === email);
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = {
      id: generateId(),
      email,
      name,
      role: "student",
      createdAt: Date.now()
    };

    db.data.users.push(user);
    await db.write();

    res.json({ message: "User registered", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};
