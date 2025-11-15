import express from "express";
import { autoAssign } from "../controllers/agentController.js";

const router = express.Router();

router.post("/auto-assign", autoAssign);

export default router;
