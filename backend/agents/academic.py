
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

class SendAcademicEmailTool(BaseTool):
    name: str = "send_academic_email"
    description: str = "Dummy email sender tool for Academic Office"
    args_schema: Type[BaseModel] = EmailInput

    def _run(self, subject: str, body: str):
        print("\n====== ACADEMIC OFFICE EMAIL (DUMMY) ======")
        print("Subject:", subject)
        print("Body:", body)
        print("==========================================\n")
        return "Academic office email sent successfully."

send_academic_email = SendAcademicEmailTool()

# ============================================
# 3) ACADEMIC AGENTS
# ============================================

academic_followup_agent = Agent(
    role="Academic Assistance Conversational Bot",
    goal="""
    Collect details about academic-related queries.
    Ask ONE question at a time.

    Required information:
    – Student name
    – USN
    – Department / Semester
    – Query Type (Notes / PPT request / Portion / CGPA query / Material request / Doubt clarification)
    – Subject (if applicable)
    – Need type (Documents? Explanation? Syllabus? Marks clarification?)
    – Urgency (High/Medium/Low)

    After collecting all details say:
    "Thank you. I have collected all academic information. Preparing your request now."
    """,
    backstory="You assist students with academic queries like notes, PPTs, CGPA, syllabus and materials.",
    memory=True,
    allow_delegation=False,
    llm=llm
)

academic_structuring_agent = Agent(
    role="Academic Query Structuring Specialist",
    goal="""
    Convert the conversation into a JSON object:
    {
      "student_name": "",
      "usn": "",
      "department": "",
      "semester": "",
      "query_type": "",
      "subject": "",
      "need_type": "",
      "urgency": "",
      "full_summary": ""
    }
    """,
    backstory="Expert in structuring academic data into JSON.",
    memory=False,
    allow_delegation=False,
    llm=llm
)

academic_email_agent = Agent(
    role="Formal Academic Email Writer",
    goal="Convert the structured JSON into a professional email for the Academic Department.",
    backstory="Specialist in academic communication.",
    memory=False,
    llm=llm
)

academic_dispatcher_agent = Agent(
    role="Academic Email Dispatcher",
    goal="Send email using send_academic_email()",
    backstory="Responsible for sending the final academic email.",
    tools=[send_academic_email],
    memory=False,
    llm=llm
)

# ============================================
# 4) CREW BUILDER
# ============================================

def build_academic_crew():
    t1 = Task(
        description="Collect academic query details.",
        expected_output="Complete list of academic details collected from the student.",
        agent=academic_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected details into structured academic JSON.",
        expected_output="A validated JSON object for academic issue.",
        agent=academic_structuring_agent
    )

    t3 = Task(
        description="Convert structured JSON into a formal academic email.",
        expected_output="Formatted email body for academic department.",
        agent=academic_email_agent
    )

    t4 = Task(
        description="Send academic email using dispatcher tool.",
        expected_output="Email sent successfully message.",
        agent=academic_dispatcher_agent
    )

    return Crew(
        agents=[academic_followup_agent, academic_structuring_agent, academic_email_agent, academic_dispatcher_agent],
        tasks=[t1, t2, t3, t4]
    )

def academic_agent(initial_message: str):
    crew = build_academic_crew()
    response = crew.kickoff({"input": initial_message})

    output = getattr(
        response,
        "output_text",
        getattr(response, "result", str(response))
    )

    return output
