import db from "../config/db.js";

export const autoAssign = async (req, res) => {
  await db.read();

  const unassigned = db.data.tickets.filter(t => t.assignedTo === null);

  // dummy logic — later replaced with GenAI agent
  unassigned.forEach(t => {
    t.assignedTo = "office-admin-123";
  });

  await db.write();

  res.json({ message: "Auto-assigned tickets", tickets: unassigned });
};
