
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




llm = LLM(
    model="llama-3.3-70b-versatile",   # ✅ ACTIVE Groq model
    api_key=os.getenv("GROQ_API_KEY"),
    provider="openai",
    base_url="https://api.groq.com/openai/v1",
    temperature=0.7
)

# ============================================
# 2) EMAIL SENDER FUNCTION
# ============================================
class EmailInput(BaseModel):
    subject: str = Field(..., description="Email subject including urgency")
    body: str = Field(..., description="Full email body")

class RealHostelEmailTool(BaseTool): 
    name: str = "real_hostel_email" 
    description: str = "Send real academic complaint email using SMTP" 
    args_schema: Type[BaseModel] = EmailInput 
    def _run(self, subject: str, body: str): 
        sender_email = os.getenv("MAIL_USER") 
        sender_pass = os.getenv("MAIL_PASS") 
        receiver_email = "saiarunkumar.is23@rvce.edu.in" 
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
# 3) ACADEMIC AGENTS
# ============================================

academic_followup_agent = Agent(
    role="Academic Issue Conversational Bot",
    goal="""
    Collect academic complaint details.
    Ask ONE question at a time.

     REQUIRED FIELDS (ask in this exact order):
    1. Student name
    2. USN
    3. Department / Semester
    4. Query Type (Notes / PPT request / Portion / CGPA query / Material request / Doubt clarification)
    5. Problem description


    IMPORTANT RULES:
    - NEVER ask about urgency
    - NEVER ask the question again and again
    - NEVER guess missing answers
    - AFTER collecting problem description, STOP asking questions
    - End with EXACTLY this sentence:
      "Thank you. I have all the information and will now file your complaint."
    """,
    backstory="Expert academic maintanence agent",
    memory=True,
    allow_delegation=False,
    llm=llm
)

academic_structuring_agent = Agent(
    role="Academic Query Structuring Agent",
    goal="""
    Convert the final conversation into JSON.

    RULES:
    - Extract REAL values from conversation
    - DO NOT leave any field empty
    - Infer urgency internally (do NOT ask user)

    Urgency rules:
    - guess everthing as medium
    - Medium → toilet, leakage, furniture
    
    - Do not put random informations in between other then json

    OUTPUT JSON ONLY:
    {
      "student_name": "",
      "USN": "",
      "Department_Semester": "",
      "Query_Type": "",
      "problem_description": "",
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
    role="Email Formatting Agent",
    goal="""
    You are given a structured JSON with complaint details.

    STRICT RULES:
    - DO NOT use placeholders like [Student Name]
    - ALWAYS substitute actual values from JSON
    - Use actual names from the json format do not use random
    - Keep the email SHORT (max 8–10 lines)
    - Subject MUST include urgency in CAPS
    - Highlight urgency clearly in the body
    - don not use jhon doe as name
    -<x> every where x to be replaced by real json value from questions
    - mail should be properly formatted like one line after other line
    SUBJECT FORMAT (MANDATORY):
    [<URGENCY> URGENCY] Academic Issue

    BODY FORMAT (MANDATORY):

    Dear Academic Management Team,
     I am <student_name> of USN <USN> , of department <Department_Semester>

    Issue: <problem_description>
    Urgency: <urgency>

    Kindly arrange maintenance at the earliest.

    Thank you,
    <student_name>
    """,
    backstory="Email Formatting Agent",
    memory=False,
    allow_delegation=False,
    llm=llm
)

academic_dispatcher_agent = Agent(
    role="Academic Dispatcher",
     goal="""
    You will ONLY send an email if ALL conditions are met:

    CONDITIONS (MANDATORY):
    - You receive BOTH:
        - subject
        - body
    - Subject must contain one of:
        [HIGH URGENCY], [MEDIUM URGENCY], [LOW URGENCY]
    - Body must NOT contain placeholders like:
        [name], [USN], <student_name>, etc.

    IF CONDITIONS ARE NOT MET:
    - DO NOTHING
    - DO NOT call any tool
    - Return: "Waiting for complete email content."

    WHEN CONDITIONS ARE MET:
    - Call real_hostel_email exactly once
    - do not send mail before all conditions are met 
    -while sending mail have all the info taken from user in place of placeholders dont put random info
    """,
    backstory="U r a dispactcher agent",
    tools=[real_hostel_email],
    allow_delegation=False,
    llm=llm
)

# ============================================
# 4) CREW BUILDER
# ============================================

def build_academic_crew():
    t1 = Task(
        description="Collect academic query details.",
        expected_output="Final confirmation sentence only.",
        agent=academic_followup_agent,
        interactive=True,
        human_input=True
    )

    t2 = Task(
        description="Convert collected details into  JSON.",
        expected_output="Valid JSON object only.",
        agent=academic_structuring_agent
    )

    t3 = Task(
        description="Generate a formal email using the JSON.",
        expected_output="Email subject and body.",
        agent=academic_email_agent
    )

    t4 = Task(
        description="Send  email using the tool.",
        expected_output="Email sent confirmation.",
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
