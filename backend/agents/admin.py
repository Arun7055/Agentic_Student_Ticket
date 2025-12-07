# ============================================
#       ADMIN QUERY BOT – GEMINI API
# ============================================

import os
from dotenv import load_dotenv
load_dotenv()

from utils import get_api_key
from flask import Flask, request, jsonify

from crewai import Agent, Crew, Task, LLM
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type


# ============================================
#  1) GEMINI CONFIG
# ============================================

gemini_api_key = get_api_key()
os.environ["GEMINI_API_KEY"] = gemini_api_key

llm = LLM(
    model="gemini-2.5-flash",
    api_key=gemini_api_key,
    provider="gemini"
)


# ============================================
# 2) EMAIL TOOL
# ============================================

class EmailInput(BaseModel):
    subject: str = Field(..., description="Email subject")
    body: str = Field(..., description="Email content")

class SendAdminEmailTool(BaseTool):
    name: str = "send_admin_email"
    description: str = "Dummy email sender for admin department"
    args_schema: Type[BaseModel] = EmailInput

    def _run(self, subject: str, body: str):
        print("\n====== ADMIN EMAIL SENT (DUMMY) ======")
        print("Subject:", subject)
        print("Body:", body)
        print("======================================\n")
        return "Email sent successfully."

send_admin_email = SendAdminEmailTool()


# ============================================
# 3) AGENTS
# ============================================

admin_followup_agent = Agent(
    role="Admin Issue Conversational Bot",
    goal="""
    Collect general admin-related request details.
    Ask ONE question at a time.

    Required fields:
    – Student name
    – USN
    – Type of request 
    – Detailed problem/request description
    – Any needed date (if applicable)
    – Urgency (High/Medium/Low)

    After collecting all details, say:
    "Thank you. I have collected all information and will now process your request."
    """,
    backstory="Expert in handling all general college admin requests.",
    memory=True,
    allow_delegation=False,
    llm=llm
)

admin_structuring_agent = Agent(
    role="Admin Request Structuring Agent",
    goal="""
    Convert the final conversation into JSON:
    {
      "student_name": "",
      "usn": "",
      "request_type": "",
      "description": "",
      "date_required": "",
      "urgency": "",
      "full_summary": ""
    }
    """,
    backstory="Organises all admin requests into structured format.",
    memory=False,
    allow_delegation=False,
    llm=llm
)

admin_email_agent = Agent(
    role="Admin Email Formatting Agent",
    goal="Convert structured JSON into a professional email format.",
    backstory="Expert in drafting formal administrative emails.",
    memory=False,
    llm=llm
)

admin_dispatcher_agent = Agent(
    role="Admin Request Dispatcher",
    goal="Send email using send_admin_email().",
    backstory="Handles forwarding final admin email.",
    tools=[send_admin_email],
    memory=False,
    llm=llm
)


# ============================================
# 4) FRESH CREW BUILDER
# ============================================

def build_admin_crew():
    t1 = Task(
        description="Collect admin request details from student.",
        expected_output="A structured conversation with all required fields.",
        agent=admin_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected details into structured JSON.",
        expected_output="A JSON object with properly formatted admin request.",
        agent=admin_structuring_agent
    )

    t3 = Task(
        description="Convert structured JSON into email content.",
        expected_output="A professionally formatted admin email.",
        agent=admin_email_agent
    )

    t4 = Task(
        description="Send email using the admin email tool.",
        expected_output="A confirmation message: 'Email sent successfully'.",
        agent=admin_dispatcher_agent
    )

    return Crew(
        agents=[
            admin_followup_agent,
            admin_structuring_agent,
            admin_email_agent,
            admin_dispatcher_agent
        ],
        tasks=[t1, t2, t3, t4]
    )


# ============================================
# 5) MAIN AGENT ENTRY POINT
# ============================================

def admin_agent(initial_message: str):
    crew = build_admin_crew()
    response = crew.kickoff({"input": initial_message})

    output = getattr(
        response,
        "output_text",
        getattr(response, "result", str(response))
    )

    return output
