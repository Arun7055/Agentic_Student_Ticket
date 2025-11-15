import express from "express";
import { createTicket, listTickets } from "../controllers/ticketController.js";

const router = express.Router();

router.post("/create", createTicket);
router.get("/list", listTickets);

export default router;
