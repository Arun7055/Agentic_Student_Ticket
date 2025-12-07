# ============================================
#       PLACEMENT QUERY BOT – GEMINI API
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
    body: str = Field(..., description="Email body")

class SendPlacementEmailTool(BaseTool):
    name: str = "send_placement_email"
    description: str = "Dummy email sender tool for Placement Office"
    args_schema: Type[BaseModel] = EmailInput

    def _run(self, subject: str, body: str):
        print("\n====== PLACEMENT OFFICE EMAIL (DUMMY) ======")
        print("Subject:", subject)
        print("Body:", body)
        print("============================================\n")
        return "Placement office email sent successfully."

send_placement_email = SendPlacementEmailTool()

# ============================================
# 3) PLACEMENT AGENTS
# ============================================

placement_followup_agent = Agent(
    role="Placement Assistance Conversational Bot",
    goal="""
    Collect details about placement-related queries.
    Ask ONE question at a time.

    Required information:
    – Student name
    – USN
    – Branch / Year
    – Query Type (Dream company? Open dream? Internship? Company arrival dates? Eligibility? Drive details?)
    – Company name (if applicable)
    – Specific concern (Eligibility, package, process, internship offer, cutoff CGPA, etc.)
    – Urgency (High/Medium/Low)

    After collecting all details say:
    "Thank you. I have collected your placement query. Preparing your request now."
    """,
    backstory="You help students with placement office-related queries such as company arrival, dream/open dream status, internships, eligibility and placement process.",
    memory=True,
    allow_delegation=False,
    llm=llm
)

placement_structuring_agent = Agent(
    role="Placement Query Structuring Specialist",
    goal="""
    Convert the conversation into a JSON object:
    {
      "student_name": "",
      "usn": "",
      "branch": "",
      "year": "",
      "query_type": "",
      "company_name": "",
      "specific_concern": "",
      "urgency": "",
      "full_summary": ""
    }
    """,
    backstory="Expert in structuring placement queries into JSON format.",
    memory=False,
    allow_delegation=False,
    llm=llm
)

placement_email_agent = Agent(
    role="Formal Placement Email Writer",
    goal="Convert the structured JSON into a formal email for the Placement Department.",
    backstory="Skilled in writing emails related to campus placements.",
    memory=False,
    llm=llm
)

placement_dispatcher_agent = Agent(
    role="Placement Email Dispatcher",
    goal="Send email using send_placement_email()",
    backstory="Responsible for sending the final placement email.",
    tools=[send_placement_email],
    memory=False,
    llm=llm
)

# ============================================
# 4) CREW BUILDER
# ============================================

def build_placement_crew():
    t1 = Task(
        description="Collect placement query details.",
        expected_output="Complete list of placement query details collected from the student.",
        agent=placement_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected information into structured placement JSON.",
        expected_output="A validated JSON object for placement issue.",
        agent=placement_structuring_agent
    )

    t3 = Task(
        description="Convert structured JSON into a formal placement email.",
        expected_output="Formatted email for placement department.",
        agent=placement_email_agent
    )

    t4 = Task(
        description="Send placement email using dispatcher tool.",
        expected_output="Email sent successfully message.",
        agent=placement_dispatcher_agent
    )

    return Crew(
        agents=[placement_followup_agent, placement_structuring_agent, placement_email_agent, placement_dispatcher_agent],
        tasks=[t1, t2, t3, t4]
    )

def placement_agent(initial_message: str):
    crew = build_placement_crew()
    response = crew.kickoff({"input": initial_message})

    output = getattr(
        response,
        "output_text",
        getattr(response, "result", str(response))
    )

    return output
