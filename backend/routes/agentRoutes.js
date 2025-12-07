import express from "express";
import { autoAssign, processTicket, agentReply } from "../controllers/agentController.js";

const router = express.Router();

// Auto-assign department using AI
router.post("/auto-assign", autoAssign);

// Triggered when ticket is created → starts AI conversation
router.post("/start", processTicket);

// When user responds → passes message back to agent
router.post("/reply", agentReply);

export default router;
