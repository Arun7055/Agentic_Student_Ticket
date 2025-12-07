import db from "../config/db.js";
import { sendToHostelStart, sendToHostelReply } from "../services/aiAgent.js";
import {sendToLibraryStart,sendToLibraryReply} from "../services/aiAgent.js"
import { sendToExamCellStart, sendToExamCellReply } from "../services/aiAgent.js";
import {sendToDeanStart,sendToDeanReply} from "../services/aiAgent.js"
import { sendToFeesStart, sendToFeesReply } from "../services/aiAgent.js";
import {sendToAdminStart,sendToAdminReply} from "../services/aiAgent.js"
import {sendToPlacementStart,sendToPlacementReply} from "../services/aiAgent.js"


// --------------------------------------------------
// Auto-assign tickets (dummy) 
// --------------------------------------------------
export const autoAssign = async (req, res) => {
  await db.read();

  const unassigned = db.data.tickets.filter(t => !t.assignedTo); // FIXED

  unassigned.forEach(t => {
    t.assignedTo = "office-admin-123";
  });

  await db.write();

  return res.json({
    message: "Auto-assigned tickets",
    tickets: unassigned
  });
};


// --------------------------------------------------
// When ticket is created → route to correct AI agent
// --------------------------------------------------
export async function processTicket(req, res) {
  const ticket = req.body;

  if (!ticket.id || !ticket.description) {
    return res.status(400).json({ error: "Missing ticket fields (id, description)" });
  }

  if (!ticket.department) {
    return res.status(400).json({ error: "Department missing" });
  }

  const dept = ticket.department.toLowerCase();

  console.log(dept)
  // -------------------------------
  //   HOSTEL AI
  // -------------------------------
  if (dept === "hostel office") {
    try {
      const response = await sendToHostelStart(ticket);
      return res.json(response);

    } catch (err) {
      console.error("Python server error:", err);
      return res.status(500).json({
        error: "Hostel AI server down",
        details: err.message
      });
    }
  }


  // -------------------------------
  //   LIBRARY AI
  // -------------------------------
  if (dept === "librarian") {
    try {
      const response = await sendToLibraryStart(ticket);
      return res.json(response);

    } catch (err) {
      console.error("Library Python error:", err);
      return res.status(500).json({
        error: "Library AI server down",
        details: err.message
      });
    }
  }
  //fee office
  if (dept === "fee office") {
    try {
      const response = await sendToFeesStart(ticket);
      return res.json(response);

    } catch (err) {
      console.error("fee office Python error:", err);
      return res.status(500).json({
        error: "fee office AI server down",
        details: err.message
      });
    }
  }
  if (dept === "admin office") {
    try {
      const response = await sendToAdminStart(ticket);
      return res.json(response);

    } catch (err) {
      console.error("admin office Python error:", err);
      return res.status(500).json({
        error: "admin office AI server down",
        details: err.message
      });
    }
  }
   
   if (dept === "placement cell") {
    try {
      const response = await sendToPlacementStart(ticket);
      return res.json(response);

    } catch (err) {
      console.error("placement Python error:", err);
      return res.status(500).json({
        error: "placemnet AI server down",
        details: err.message
      });
    }
  }
  if (dept === "academic Affairs") {
    try {
      const response = await sendToDeanStart(ticket);
      return res.json(response);

    } catch (err) {
      console.error("dean Python error:", err);
      return res.status(500).json({
        error: "dean AI server down",
        details: err.message
      });
    }
  }
  if (dept === "exam cell") {
    try {
      const response = await  sendToExamCellStart(ticket);
      return res.json(response);

    } catch (err) {
      console.error("admin office Python error:", err);
      return res.status(500).json({
        error: "admin office AI server down",
        details: err.message
      });
    }
  }



  // Any other department not supported by AI
  return res.status(400).json({
    error: "Unsupported department (Hostel Office & Library supported)"
  });
}



// ********************************************************
//               USER REPLY (AFTER AI ASKS QUESTION)
// ********************************************************

export async function agentReply(req, res) {
  try {
    const { ticketId, message, department } = req.body;

    if (!ticketId || !message || !department) {
      return res.status(400).json({ 
        error: "ticketId, message, and department are required" 
      });
    }

    const dept = department.toLowerCase();


    // ---------------------------------
    //     HOSTEL
    // ---------------------------------
    if (dept === "hostel office") {
      return res.json(await sendToHostelReply({ ticketId, message }));
    }

    // ---------------------------------
    //     LIBRARY
    // ---------------------------------
    if (dept === "library" || dept === "librarian") {
      return res.json(await sendToLibraryReply({ ticketId, message }));
    }

    // ---------------------------------
    //     EXAM CELL
    // ---------------------------------
    if (dept === "exam cell") {
      return res.json(await sendToExamCellReply({ ticketId, message }));
    }

    // ---------------------------------
    //     DEAN / ACADEMIC
    // ---------------------------------
    if (dept === "academic affairs" || dept === "dean") {
      return res.json(await sendToDeanReply({ ticketId, message }));
    }

    // ---------------------------------
    //     FEE OFFICE
    // ---------------------------------
    if (dept === "fee office") {
      return res.json(await sendToFeesReply({ ticketId, message }));
    }

    // ---------------------------------
    //     ADMIN OFFICE
    // ---------------------------------
    if (dept === "admin office") {
      return res.json(await sendToAdminReply({ ticketId, message }));
    }

    // ---------------------------------
    //     PLACEMENT CELL
    // ---------------------------------
    if (dept === "placement cell") {
      return res.json(await sendToPlacementReply({ ticketId, message }));
    }

    return res.status(400).json({
      error: "Unsupported department for reply"
    });

  } catch (err) {
    console.error("Reply error:", err);
    return res.status(500).json({ error: "Agent reply failed" });
  }
}
