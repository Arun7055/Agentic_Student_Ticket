# ============================================
#       EXAM QUERY BOT – GEMINI API
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

class SendExamEmailTool(BaseTool):
    name: str = "send_exam_email"
    description: str = "Dummy email sender tool for Exam Cell"
    args_schema: Type[BaseModel] = EmailInput

    def _run(self, subject: str, body: str):
        print("\n====== EXAM CELL EMAIL (DUMMY) ======")
        print("Subject:", subject)
        print("Body:", body)
        print("=====================================\n")
        return "Exam cell email sent successfully."

send_exam_email = SendExamEmailTool()

# ============================================
# 3) EXAM AGENTS
# ============================================

exam_followup_agent = Agent(
    role="Exam Query Conversational Bot",
    goal="""
    Collect exam-related queries from students.
    Ask ONE question at a time.

    Required information:
    – Student name
    – USN
    – Year of study (1st/2nd/3rd/4th year)
    – Department
    – Query Type:
         (Exam dates / Paper correction status / Hall ticket issues /
          Backlog exam / Revaluation / Timetable / Format doubts /
          Internal marks / Attendance shortage / General exam queries)
    – Subject name (if relevant)
    – Additional details (if needed)
    – Urgency (High/Medium/Low)

    After collecting all details say:
    "Thank you. I have collected all exam-related details. Preparing your request now."
    """,
    backstory="You are the assistant for the Exam Cell handling doubts about exam dates, corrections, results, revaluation, etc.",
    memory=True,
    allow_delegation=False,
    llm=llm
)

exam_structuring_agent = Agent(
    role="Exam Query Structuring Specialist",
    goal="""
    Convert the conversation into the following JSON:

    {
      "student_name": "",
      "usn": "",
      "year_of_study": "",
      "department": "",
      "query_type": "",
      "subject": "",
      "additional_details": "",
      "urgency": "",
      "full_summary": ""
    }
    """,
    backstory="Expert in formatting exam-related data into JSON.",
    memory=False,
    allow_delegation=False,
    llm=llm
)

exam_email_agent = Agent(
    role="Formal Exam Cell Email Writer",
    goal="Convert the structured JSON into a professional email for the Exam Department.",
    backstory="Expert email formatter for exam-related communications.",
    memory=False,
    llm=llm
)

exam_dispatcher_agent = Agent(
    role="Exam Email Dispatcher",
    goal="Send email using send_exam_email()",
    backstory="Responsible for sending the final exam cell email.",
    tools=[send_exam_email],
    memory=False,
    llm=llm
)

# ============================================
# 4) CREW BUILDER
# ============================================

def build_exam_crew():
    t1 = Task(
        description="Collect exam-related query details.",
        expected_output="Complete exam query details collected from the student.",
        agent=exam_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected data into structured JSON.",
        expected_output="Validated JSON object representing exam-related query.",
        agent=exam_structuring_agent
    )

    t3 = Task(
        description="Convert the structured JSON into a formal email.",
        expected_output="Formatted email body for the exam department.",
        agent=exam_email_agent
    )

    t4 = Task(
        description="Send the exam email.",
        expected_output="Email sent successfully.",
        agent=exam_dispatcher_agent
    )

    return Crew(
        agents=[exam_followup_agent, exam_structuring_agent, exam_email_agent, exam_dispatcher_agent],
        tasks=[t1, t2, t3, t4]
    )

# ============================================
# 5) EXAM AGENT MAIN FUNCTION
# ============================================

def exam_agent(initial_message: str):
    crew = build_exam_crew()
    response = crew.kickoff({"input": initial_message})

    output = getattr(
        response,
        "output_text",
        getattr(response, "result", str(response))
    )

    return output
