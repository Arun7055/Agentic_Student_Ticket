import express from "express";
import cors from "cors";
import db, { initDB } from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";

console.log("RUNNING CORRECT INDEX.JS");

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Initialize DB
  await initDB();

  // health check
  app.get("/", (req, res) => {
    res.json({ message: "Server is running fine!" });
  });

  // test-db
  app.get("/test-db", async (req, res) => {
    await db.read();
    db.data.users.push({ name: "test user" });
    await db.write();
    res.json({ message: "DB write success!", data: db.data });
  });

  // mount routes
  app.use("/api/users", userRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/agent", agentRoutes);

  app.listen(3000, () => {
    console.log("Server started on http://localhost:3000");
  });
}

startServer();
