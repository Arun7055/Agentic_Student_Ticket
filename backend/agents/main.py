from flask import Flask, request, jsonify
from flask_cors import CORS
# Import ALL department agents
from hostel import hostel_agent
from library import library_agent
from admin import admin_agent
from fees import fees_agent
from academic import academic_agent
from exam import exam_agent
from placement import placement_agent
import logging




from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json
import os

app = FastAPI()

# Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = r"C:\student_ticket\Agentic_Student_Ticket\backend\db.json"



app = Flask(__name__)
CORS(app)




# Silence CrewAI telemetry logs
logging.getLogger("crewai.telemetry").setLevel(logging.CRITICAL)

# Silence OpenTelemetry exporter logs
logging.getLogger("opentelemetry").setLevel(logging.CRITICAL)

# Silence urllib3 retry/timeout logs
logging.getLogger("urllib3").setLevel(logging.CRITICAL)
# -------------------------
# Helper for Validation
# -------------------------
def validate_fields(data, required):
    missing = [f for f in required if f not in data or not data[f]]
    if missing:
        return f"Missing fields: {', '.join(missing)}"
    return None


# ============================================================
# ✅ HOSTEL
# ============================================================
@app.get("/hostel/start")
def health_check():
    return {"status": "Hostel service running"}

@app.post("/hostel/start")
def hostel_start():
    data = request.json
    error = validate_fields(data, ["ticketId", "description"])
    if error:
        return jsonify({"error": error}), 400
    return jsonify(hostel_agent(data["description"]))




@app.post("/hostel/reply")
def hostel_reply():
    data = request.json
    error = validate_fields(data, ["ticketId", "message"])
    if error:
        return jsonify({"error": error}), 400



    return jsonify(hostel_agent(data["message"]))


DB_PATH = r"C:\student_ticket\Agentic_Student_Ticket\backend\db.json"

@app.get("/api/db")
def get_db_content():
    if not os.path.exists(DB_PATH):
        return {
            "error": "db.json not found",
            "data": []
        }

    try:
        with open(DB_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        return data  # returns ENTIRE db.json content

    except Exception as e:
        return {
            "error": str(e),
            "data": []
        }
# ============================================================
# ✅ LIBRARY
# ============================================================

@app.post("/library/start")
def library_start():
    data = request.json
    error = validate_fields(data, ["ticketId", "description"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(library_agent(data["description"]))


@app.post("/library/reply")
def library_reply():
    data = request.json
    error = validate_fields(data, ["ticketId", "message"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(library_agent(data["message"]))


# ============================================================
# ✅ ADMIN OFFICE
# ============================================================

@app.post("/admin/start")
def admin_start():
    data = request.json
    error = validate_fields(data, ["ticketId", "description"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(admin_agent(data["description"]))


@app.post("/admin/reply")
def admin_reply():
    data = request.json
    error = validate_fields(data, ["ticketId", "message"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(admin_agent(data["message"]))


# ============================================================
# ✅ FEE OFFICE
# ============================================================

@app.post("/fees/start")
def fees_start():
    data = request.json
    error = validate_fields(data, ["ticketId", "description"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(fees_agent(data["description"]))


@app.post("/fees/reply")
def fees_reply():
    data = request.json
    error = validate_fields(data, ["ticketId", "message"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(fees_agent(data["message"]))


# ============================================================
# ✅ ACADEMIC AFFAIRS
# ============================================================

@app.post("/academic/start")
def academic_start():
    data = request.json
    error = validate_fields(data, ["ticketId", "description"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(academic_agent(data["description"]))


@app.post("/academic/reply")
def academic_reply():
    data = request.json
    error = validate_fields(data, ["ticketId", "message"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(academic_agent(data["message"]))


# ============================================================
# ✅ EXAM CELL
# ============================================================

@app.post("/exam/start")
def exam_start():
    data = request.json
    error = validate_fields(data, ["ticketId", "description"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(exam_agent(data["description"]))


@app.post("/exam/reply")
def exam_reply():
    data = request.json
    error = validate_fields(data, ["ticketId", "message"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(exam_agent(data["message"]))


# ============================================================
# ✅ PLACEMENT CELL
# ============================================================

@app.post("/placement/start")
def placement_start():
    data = request.json
    error = validate_fields(data, ["ticketId", "description"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(placement_agent(data["description"]))


@app.post("/placement/reply")
def placement_reply():
    data = request.json
    error = validate_fields(data, ["ticketId", "message"])
    if error:
        return jsonify({"error": error}), 400

    return jsonify(placement_agent(data["message"]))


# ============================================================

if __name__ == "__main__":
    app.run(host="127.0.0.1",port=5001, debug=True)
