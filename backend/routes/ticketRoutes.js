import express from "express";
import { createTicket, listTickets, listDeptTickets } from "../controllers/ticketController.js";

const router = express.Router();

router.post("/create", createTicket);
router.get("/list", listTickets);
router.get("/department/:deptId", listDeptTickets);
router.get("/student/:email", listTickets);

export default router;
