import os
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

class SendLibraryEmailTool(BaseTool):
    name: str = "send_library_email"
    description: str = "Dummy library complaint email sender"
    args_schema: Type[BaseModel] = EmailInput

    def _run(self, subject: str, body: str):
        print("\n====== LIBRARY EMAIL SENT (DUMMY) ======")
        print("Subject:", subject)
        print("Body:", body)
        print("========================================\n")
        return "Library email sent successfully."

send_library_email = SendLibraryEmailTool()


# ============================================
# 3) AGENTS (same as your version)
# ============================================

# ============================================
# 3) AGENTS : Library Issue Bot
# ============================================

library_followup_agent = Agent(
    role="Library Issue Conversational Bot",
    goal="""
    Collect library complaint details.
    Ask ONE question at a time.

    Required fields:
    – Student name
    – USN 
    – Department
    – Book section
    – Book name
    – Issue type (missing pages / torn / unavailable / lost / wrong entry)
    – Urgency (High/Medium/Low)

    After collecting ALL details, say:
    "Thank you. I have all the information and will now file your library complaint."
    """,
    backstory="Expert assistant for library issue reporting.",
    memory=True,
    allow_delegation=False,
    llm=llm
)

library_structuring_agent = Agent(
    role="Library JSON Structuring Agent",
    goal="""
    Convert final conversation into valid JSON:
    {
      "student_name": "",
      "department": "",
      "book_section": "",
      "book_name": "",
      "issue_type": "",
      "urgency": "",
      "full_summary": ""
    }
    """,
    backstory="JSON structuring specialist.",
    memory=False,
    allow_delegation=False,
    llm=llm
)

library_email_agent = Agent(
    role="Library Email Formatting Agent",
    goal="Convert the structured JSON into a professional library complaint email.",
    backstory="Expert academic email formatter.",
    memory=False,
    llm=llm
)

library_dispatcher_agent = Agent(
    role="Library Complaint Dispatcher",
    goal="Send email using send_hostel_email() tool.",
    backstory="Handles final email sending.",
    tools=[send_library_email],
    memory=False,
    llm=llm
)



# ============================================
# 4) CREATE FRESH CREW (important!)
# ============================================

def build_crew():
    t1 = Task(
        description="Collect library complaint details.",
        expected_output="A structured list of library complaint details collected from the student.",
        agent=library_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected details into valid JSON.",
        expected_output="A validated JSON object representing the library complaint.",
        agent=library_structuring_agent
    )

    t3 = Task(
        description="Convert structured JSON into a clean email body.",
        expected_output="A well-formatted email.",
        agent=library_email_agent
    )

    t4 = Task(
        description="Send the email using the dispatcher tool.",
        expected_output="Email sent successfully.",
        agent=library_dispatcher_agent
    )

    return Crew(
        agents=[library_followup_agent, library_structuring_agent, library_email_agent, library_dispatcher_agent],
        tasks=[t1, t2, t3, t4]
    )



def library_agent(initial_message: str):
    crew = build_crew()
    response = crew.kickoff({"input": initial_message})

    # extract output text safely (your version requires this)
    output = getattr(
        response, 
        "output_text",
        getattr(response, "result", str(response))
    )

    return output