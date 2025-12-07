# ============================================
#       HOSTEL QUERY BOT – GEMINI API
# ============================================

import os
from dotenv import load_dotenv;
load_dotenv()
from utils import get_api_key
from flask import Flask, request, jsonify

from crewai import Agent, Crew, Task, LLM
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type

4

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
    body: str = Field(..., description="Email body")

class SendHostelEmailTool(BaseTool):
    name: str = "send_hostel_email"
    description: str = "Dummy email sender tool"
    args_schema: Type[BaseModel] = EmailInput

    def _run(self, subject: str, body: str):
        print("\n====== EMAIL SENT (DUMMY) ======")
        print("Subject:", subject)
        print("Body:", body)
        print("================================\n")
        return "Email sent successfully."

send_hostel_email = SendHostelEmailTool()


# ============================================
# 3) AGENTS (same as your version)
# ============================================

hostel_followup_agent = Agent(
    role="Hostel Issue Conversational Bot",
    goal="""
    Collect hostel complaint details.
    Ask ONE question at a time.

    Required:
    – Student name
    – Block
    – Floor
    – Room number
    – Issue type
    – Urgency (High/Medium/Low)

    After collecting all, say:
    "Thank you. I have all the information and will now file your complaint."
    """,
    backstory="Expert hostel maintenance assistant.",
    memory=True,
    allow_delegation=False,
    llm=llm
)

hostel_structuring_agent = Agent(
    role="Incident Structuring Agent",
    goal="""
    Convert final conversation into JSON:
    {
      "student_name": "",
      "block": "",
      "floor": "",
      "room_no": "",
      "problem_type": "",
      "urgency": "",
      "full_summary": ""
    }
    """,
    backstory="JSON formatting specialist.",
    memory=False,
    allow_delegation=False,
    llm=llm
)

email_agent = Agent(
    role="Email Formatting Agent",
    goal="Turn the structured JSON into a formal email.",
    backstory="Expert email formatter.",
    memory=False,
    llm=llm
)

dispatcher_agent = Agent(
    role="Hostel Complaint Dispatcher",
    goal="Send email using send_hostel_email().",
    backstory="You handle final email sending.",
    tools=[send_hostel_email],
    memory=False,
    llm=llm
)


# ============================================
# 4) CREATE FRESH CREW (important!)
# ============================================

def build_crew():
    t1 = Task(
        description="Collect hostel complaint details.",
        expected_output="A structured list of hostel complaint details collected from the student.",
        agent=hostel_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected complaint into valid JSON.",
        expected_output="A validated JSON object representing the hostel complaint.",
        agent=hostel_structuring_agent
    )

    t3 = Task(
        description="Convert structured JSON into a clean email body.",
        expected_output="A well-formatted email content string ready to be sent.",
        agent=email_agent
    )

    t4 = Task(
        description="Send email using the email-sending tool.",
        expected_output="A confirmation message such as: 'Email sent successfully'.",
        agent=dispatcher_agent
    )

    return Crew(
        agents=[hostel_followup_agent, hostel_structuring_agent, email_agent, dispatcher_agent],
        tasks=[t1, t2, t3, t4]
    )


def hostel_agent(initial_message: str):
    crew = build_crew()
    response = crew.kickoff({"input": initial_message})

    # extract output text safely (your version requires this)
    output = getattr(
        response, 
        "output_text",
        getattr(response, "result", str(response))
    )

    return output