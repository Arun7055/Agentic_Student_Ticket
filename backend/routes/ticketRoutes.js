import express from "express";
import { createTicket, listTickets, listDeptTickets } from "../controllers/ticketController.js";

const router = express.Router();

router.post("/create", createTicket);
router.get("/list", listTickets);
router.get("/department/:dept", listDeptTickets);


export default router;
