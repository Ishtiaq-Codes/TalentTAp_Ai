# TalentTap AI

TalentTap is a next-generation, AI-driven recruitment and talent acquisition platform designed to bridge the semantic gap between world-class talent and top-tier companies. It leverages advanced Large Language Models (LLMs), natural language processing, and video analytics to streamline the hiring process, from semantic candidate matching to automated AI interviews.

## Overview

This repository contains the full monorepo for the TalentTap platform, encompassing both the Django backend and the React frontend.

**Key Features:**
- **AI Semantic Matching**: Matches candidates to job descriptions based on semantic understanding of skills and experiences, moving beyond basic keyword matching.
- **Automated AI Interviews**: Conducts initial screening interviews using an automated, conversational AI agent with real-time video processing.
- **Anti-Cheat Mechanisms**: Incorporates gaze tracking, face verification, and multi-face detection during AI interviews.
- **Smart Parsing**: Automatically extracts and structures data from uploaded resumes.
- **Copilot Assistant**: An AI assistant tailored for recruiters to draft outreach messages, analyze candidate gaps, and generate interview guides.
- **SaaS Architecture**: Built with scalable, multi-tenant principles utilizing Stripe for billing and subscription management.

## Repository Structure

This is a monorepo containing both the frontend and backend in a single version-controlled project. This structure simplifies development and allows for atomic commits across the entire stack. 

* `backend/`: Django REST Framework backend serving APIs, AI integrations (Groq/OpenAI), and database models.
* `frontend/`: React-based single-page application built with Vite, TailwindCSS, and Lucide React.
* `media/`: Local storage for uploaded assets (in production, this maps to an S3 bucket or equivalent).

### Deployment Note (Monorepo)

Having both the frontend and backend in one repository will **not** cause problems during deployment. Modern deployment pipelines (like GitHub Actions, AWS CodePipeline, or Vercel/Render) allow you to specify the "Root Directory" or the "Build Command" path. 
* When deploying the frontend (e.g., to Vercel or AWS Amplify), you simply configure the build settings to use `frontend/` as the root directory.
* When deploying the backend (e.g., to AWS EC2, Elastic Beanstalk, or App Runner), your deployment scripts will navigate to the `backend/` directory to install `requirements.txt` and run the WSGI server (Gunicorn).

## Getting Started

Detailed instructions for setting up the development environment, running the servers, and deploying the application can be found in the `DOCUMENTATION.md` file.

## Technologies Used

### Backend
- Python 3.10+
- Django 5.x
- Django REST Framework (DRF)
- JWT Authentication (SimpleJWT)
- Celery & Redis (Background Tasks)
- Postgres (Production Database) / SQLite (Development)
- Groq API / OpenAI API (LLMs)
- MediaPipe / OpenCV (Video Analysis)
- Stripe (Payments)

### Frontend
- React 18
- Vite
- TailwindCSS
- Lucide React (Icons)
- Recharts (Data Visualization)
- Context API (State Management)
- Framer Motion (Animations)

## License and Copyright

**Confidential & Proprietary**
Copyright © 2026 TalentTap AI. All Rights Reserved.

This code is the property of TalentTap AI. Unauthorized copying, distribution, modification, or public display of this project, or any portion thereof, is strictly prohibited. This repository is temporarily public for academic reporting purposes and will be converted to a private repository prior to commercial launch.
