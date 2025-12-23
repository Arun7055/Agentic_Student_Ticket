import os
from dotenv import load_dotenv
load_dotenv()
from utils import get_api_key
from flask import Flask, request, jsonify

from crewai import Agent, Crew, Task, LLM
from pydantic import BaseModel, Field
import smtplib
from typing import Type
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from crewai.tools import BaseTool

# ============================================
#  1) GEMINI CONFIG
# ============================================


llm = LLM(
    model="llama-3.3-70b-versatile",   # ✅ ACTIVE Groq model
    api_key=os.getenv("GROQ_API_KEY"),
    provider="openai",
    base_url="https://api.groq.com/openai/v1",
    temperature=0.7
)

class EmailInput(BaseModel):
    subject: str = Field(..., description="Email subject including urgency")
    body: str = Field(..., description="Full email body")

class RealHostelEmailTool(BaseTool): 
    name: str = "real_hostel_email" 
    description: str = "Send real hostel complaint email using SMTP" 
    args_schema: Type[BaseModel] = EmailInput 
    def _run(self, subject: str, body: str): 
        sender_email = os.getenv("MAIL_USER") 
        sender_pass = os.getenv("MAIL_PASS") 
        receiver_email = "sathwikpai.is23@rvce.edu.in" 
        msg = MIMEMultipart() 
        msg["From"] = sender_email 
        msg["To"] = receiver_email 
        msg["Subject"] = subject 
        msg.attach(MIMEText(body, "plain")) 
        try: 
            server = smtplib.SMTP("smtp.gmail.com", 587) 
            server.starttls() 
            server.login(sender_email, sender_pass) 
            server.sendmail(sender_email, receiver_email, msg.as_string()) 
            server.quit() 
            print("✅ EMAIL SENT SUCCESSFULLY") 
            return "Email sent successfully" 
        except Exception as e: 
            print("❌ EMAIL FAILED:", str(e)) 
            return "Email failed" 
real_hostel_email=RealHostelEmailTool()


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
    
     REQUIRED FIELDS (ask in this exact order):
    1. Student name
    2. USN
    3.Department
    4. Book sectio
    5. Book Name
    6.Issue type (missing pages / torn / unavailable / lost / wrong entry)


    IMPORTANT RULES:
    - NEVER ask about urgency
    - NEVER ask the question again and again
    - NEVER guess missing answers
    - AFTER collecting problem description, STOP asking questions
    - End with EXACTLY this sentence:
      "Thank you. I have all the information and will now file your complaint.
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
     RULES:
    - Extract REAL values from conversation
    - DO NOT leave any field empty
    - Infer urgency internally (do NOT ask user)
    Urgency rules:
    - High → lost book, book for exam ,idcard lost
    - Medium → qeury about book
    - Low → minor issues
    - Do not put random informations in between other then json

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
    goal="""
    You are given a structured JSON with library complaint details.

    STRICT RULES:
    - DO NOT use placeholders like [Student Name]
    - ALWAYS substitute actual values from JSON
    - Use actual names from the JSON, do not invent random names
    - Keep the email SHORT (max 8–10 lines)
    - Subject MUST include urgency in CAPS
    - Highlight urgency clearly in the body
    - Do not use generic names like John Doe
    - Replace every <x> with the real value from JSON
    - Format email properly with one line per item

    SUBJECT FORMAT (MANDATORY):
    [<URGENCY> URGENCY] Library Issue – Department <department>, 

    BODY FORMAT (MANDATORY):

    Dear Library Management Team,

    My name is <student_name>, Book section <book_section>,Book name<book_name>

    Issue: <problem_type>
    Urgency: <urgency>

    Kindly address this at the earliest.

    Thank you,
    <student_name>
    """,
    backstory=" Email Formatting Agent",
    memory=False,
    allow_delegation=False,
    llm=llm
)

library_dispatcher_agent = Agent(
    role="Library Complaint Dispatcher",
    goal="""
    You will ONLY send an email if ALL conditions are met:

    CONDITIONS (MANDATORY):
    - You receive BOTH:
        - subject
        - body
    - Subject must contain one of:
        [HIGH URGENCY], [MEDIUM URGENCY], [LOW URGENCY]
    - Body must NOT contain placeholders like:
        [name], <book_section>,<book_name> <student_name>, etc.

    IF CONDITIONS ARE NOT MET:
    - DO NOTHING
    - DO NOT call any tool
    - Return: "Waiting for complete email content."

    WHEN CONDITIONS ARE MET:
    - Call real_hostel_email exactly once
    """,
    backstory="Ur a dispatcher Dispatcher Agent",
    tools=[real_hostel_email],
    allow_delegation=False,
  
    llm=llm
)



# ============================================
# 4) CREATE FRESH CREW (important!)
# ============================================

def build_crew():
    t1 = Task(
        description="Collect library complaint details.",
        expected_output="Final confirmation sentence only.",
        agent=library_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected details into valid JSON.",
        expected_output="Valid JSON object only",
        agent=library_structuring_agent
    )

    t3 = Task(
        description="Generate a formal email using the JSON.",
        expected_output="Email subject and body.",
        agent=library_email_agent
    )

    t4 = Task(
        description="Send the email using the dispatcher tool.",
        expected_output="Email sent confirmation.",
        agent=library_dispatcher_agent
    )

    return Crew(
        agents=[library_followup_agent, library_structuring_agent, library_email_agent, library_dispatcher_agent],
        tasks=[t1, t2, t3, t4]
    )



def library_agent(initial_message: str):
    crew = build_crew()
    result = crew.kickoff({"input": initial_message})

    output_text = getattr(result, "output_text", getattr(result, "result", str(result)))
    return output_text
