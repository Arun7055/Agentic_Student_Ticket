# ============================================
#       FEES QUERY BOT – GEMINI API
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

class SendFeesEmailTool(BaseTool):
    name: str = "send_fees_email"
    description: str = "Dummy email sender tool for Fee Office"
    args_schema: Type[BaseModel] = EmailInput

    def _run(self, subject: str, body: str):
        print("\n====== FEE OFFICE EMAIL (DUMMY) ======")
        print("Subject:", subject)
        print("Body:", body)
        print("======================================\n")
        return "Fee office email sent successfully."

send_fees_email = SendFeesEmailTool()

# ============================================
# 3) FEES AGENTS
# ============================================

fees_followup_agent = Agent(
    role="Fee Office Conversational Bot",
    goal="""
    Collect details about fee-related issues.
    Ask ONE question at a time.

    Required information:
    – Student name
    – USN
    – What fee (Tuition/Hostel/Bus/Exam/Other)
    – Paid or Not Paid
    – Amount paid (if paid)
    – Receipt available (Yes/No)
    – Transaction ID (if available)
    – Issue type: (Refund / Receipt request / Payment pending / Clarification)
    – Urgency (High/Medium/Low)

    After collecting everything say:
    "Thank you. I have all the fee details and will now prepare your request."
    """,
    backstory="You are the assistant for Fee Office. You help with receipts, payments, fee clarifications and pending dues.",
    memory=True,
    allow_delegation=False,
    llm=llm
)

fees_structuring_agent = Agent(
    role="Fee Structuring Specialist",
    goal="""
    Convert the conversation into a JSON object in this structure:
    {
      "student_name": "",
      "usn": "",
      "fee_type": "",
      "payment_status": "",
      "amount_paid": "",
      "receipt_available": "",
      "transaction_id": "",
      "issue_type": "",
      "urgency": "",
      "full_summary": ""
    }
    """,
    backstory="Expert in organizing data into correct JSON format.",
    memory=False,
    allow_delegation=False,
    llm=llm
)

fees_email_agent = Agent(
    role="Formal Fee Office Email Writer",
    goal="Convert the structured JSON into a clean, formal email for the Fee Office.",
    backstory="Expert email formatter for administrative communication.",
    memory=False,
    llm=llm
)

fees_dispatcher_agent = Agent(
    role="Fee Office Email Dispatcher",
    goal="Send email through send_fees_email()",
    backstory="Handles the final dispatch of the formatted fee email.",
    tools=[send_fees_email],
    memory=False,
    llm=llm
)

# ============================================
# 4) CREW BUILDER
# ============================================

def build_fees_crew():
    t1 = Task(
        description="Collect fee-related issue details.",
        expected_output="Complete list of fee details collected from student.",
        agent=fees_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected details into structured JSON.",
        expected_output="A validated JSON object for fee issue.",
        agent=fees_structuring_agent
    )

    t3 = Task(
        description="Convert structured JSON into a formal email.",
        expected_output="Formatted email body for fee office.",
        agent=fees_email_agent
    )

    t4 = Task(
        description="Send email using fee office tool.",
        expected_output="Email sent successfully message.",
        agent=fees_dispatcher_agent
    )

    return Crew(
        agents=[fees_followup_agent, fees_structuring_agent, fees_email_agent, fees_dispatcher_agent],
        tasks=[t1, t2, t3, t4]
    )

def fees_agent(initial_message: str):
    crew = build_fees_crew()
    response = crew.kickoff({"input": initial_message})

    output = getattr(
        response,
        "output_text",
        getattr(response, "result", str(response))
    )

    return output
