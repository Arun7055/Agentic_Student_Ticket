# Agentic Student Ticketing System

An AI-powered student support and ticket management platform that automates the process of handling student queries and complaints in educational institutions.  
The system uses **AI agents and natural language processing** to understand student issues, route them to the correct department, collect required information through conversation, and generate structured tickets for resolution.

This project aims to improve efficiency, transparency, and communication between **students, teachers, and institutional departments**.

---

## Problem Statement

In most educational institutions, student complaints and queries are handled through emails, manual forms, or in-person visits. These systems often lead to:

- Misrouting of complaints to the wrong department
- Delayed responses
- Lack of tracking for issue resolution
- Difficulty for students in identifying the correct department
- Inefficient communication between students and staff

The goal of this project is to create an **intelligent ticketing system** that automatically understands student queries and manages them efficiently.

---

## Solution Overview

The **Agentic Student Ticketing System** allows students to submit queries in natural language.  
An AI agent analyzes the query, determines the appropriate department, and forwards the issue to a specialized department agent.

The department agent interacts with the student through a **multi-turn conversation** to collect missing information and generate a structured complaint ticket.

Once the complaint is confirmed by the student:

1. The system generates a structured complaint summary.
2. An automated email is created and sent to the respective department.
3. A ticket is created and added to the ticket logs.
4. The ticket is assigned to a teacher or staff member.
5. Students can view teacher availability and schedule discussions to resolve the issue.

---

## Key Features

### Natural Language Complaint Submission
Students can describe their issue in plain language without selecting departments manually.

### Intelligent Department Assignment
The system analyzes the complaint and automatically assigns it to the correct department such as:

- Hostel
- Academic
- Administration
- Fee Office
- Placement
- Examination
- Library

### Multi-Agent AI System
Each department has a dedicated AI agent that handles domain-specific queries and collects relevant details.

### Conversational Query Handling
Department agents interact with students through a guided conversation to collect complete information before creating a ticket.

### Automated Ticket Creation
After gathering all required details, the system converts the conversation into a structured complaint ticket.

### Automated Email Generation
A formal complaint email is automatically generated and sent to the respective department.

### Teacher Availability System
Teachers can log in and mark their available hours.  
Students can view these free slots and contact teachers to resolve their issues.

### Ticket Tracking
Students can track the status of their complaints through the ticket logs.

---

## System Architecture

The system follows a **modular full-stack architecture** consisting of four main layers:

### 1. Frontend Layer
The frontend provides the user interface where students, teachers, and administrators interact with the system.

Responsibilities:
- Student query submission
- Displaying agent responses
- Viewing ticket logs
- Showing teacher availability

Technologies used:
- React
- JavaScript
- Tailwind CSS

---

### 2. Backend Layer
The backend manages system logic, routing of tickets, and communication with AI agents.

Responsibilities:
- Ticket creation and management
- User authentication
- Department routing
- API handling

Technologies used:
- Node.js
- Express.js
- REST APIs

---

### 3. AI Agent Layer
The AI layer is responsible for understanding student queries and interacting with users.

Agents include:
- Main Ticket Analysis Agent
- Hostel Department Agent
- Academic Department Agent
- Admin Department Agent
- Fee Department Agent
- Email Generation Agent

Technologies used:
- CrewAI
- Large Language Models (LLMs)
- Python

---

### 4. Database Layer
The database stores all system data including tickets, student information, teacher availability, and logs.

Stored information:
- Student details
- Ticket records
- Department assignments
- Teacher schedules
- Complaint history

Technology used:
- LowDB (JSON-based database)

---

## Workflow

The system follows this workflow:

1. A student enters a query describing their issue.
2. The main AI agent analyzes the query and determines the appropriate department.
3. The query is assigned to the corresponding department agent.
4. The agent asks follow-up questions to gather complete information.
5. The student reviews and confirms the collected details.
6. The system generates a structured complaint.
7. An email is automatically created and sent to the relevant department.
8. A ticket is generated and added to the ticket logs.
9. A teacher or staff member is assigned to handle the issue.
10. Students can view teacher availability and contact them during free hours to resolve the issue.

---

## Tech Stack

### Frontend
- React
- JavaScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### AI & Automation
- Python
- CrewAI
- Large Language Models (LLMs)

### Database
- LowDB (JSON-based local database)

### Development Tools
- Git
- GitHub
- VS Code

---
