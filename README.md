# TalentTap – AI-Powered Digital Talent Marketplace for Smart Hiring

![TalentTap Cover](frontend/public/cover.png) *(You can replace this with an actual screenshot of your project)*

**TalentTap** is a modern, AI-powered Software-as-a-Service (SaaS) platform designed to revolutionize the recruitment industry. It bridges the gap between top-tier candidates and innovative companies by automating the most time-consuming aspects of the hiring lifecycle.

Built using a decoupled Three-Tier Architecture, TalentTap leverages advanced Natural Language Processing (NLP) for algorithmic candidate matching and utilizes Computer Vision (MediaPipe) for secure, anti-cheat AI video interviews.

---

## 🚀 Key Features

### For Candidates
* **Rich Profiles:** Build professional, comprehensive profiles with dynamic completion tracking.
* **Smart Applications:** Seamlessly apply for jobs that match your skills.
* **AI Video Interviews:** Undertake automated, proctored video interviews directly in the browser.
* **Real-time Tracking:** Monitor application statuses via an interactive dashboard.

### For Companies / Recruiters
* **Algorithmic Matching:** Instantly filter and rank candidates using the proprietary AI Matching Engine.
* **Talent Pools:** Save and categorize high-potential candidates for future opportunities.
* **Automated Video Screening:** Review AI-scored video interviews to eliminate manual screening bottlenecks.
* **Premium Subscriptions:** Unlock advanced features via seamless Stripe billing integration.

### Platform Security & Anti-Cheat
* **MediaPipe Facial Tracking:** The AI Interview room utilizes real-time facial landmark detection to prevent cheating (e.g., looking away, multiple faces).
* **JWT Authentication:** Secure, stateless JSON Web Tokens ensure robust Role-Based Access Control (RBAC).

---

## 🏗️ System Architecture

TalentTap utilizes a decoupled client-server architecture:

1. **Frontend (Presentation Layer):** Built with **React.js** and **Vite**. Features responsive "Glassmorphism" UI designs crafted with **TailwindCSS**. Complex state management is handled efficiently to provide a seamless Single Page Application (SPA) experience.
2. **Backend (Business Logic Layer):** Powered by the **Django REST Framework (Python)**. This acts as a highly scalable API gateway handling authentication, algorithmic matching, database transactions, and Stripe webhook orchestration.
3. **Database (Data Layer):** Hosted on **PostgreSQL**, strictly adhering to ACID compliance and normalized to the Third Normal Form (3NF) to guarantee data integrity.

---

## 🛠️ Technology Stack

* **Frontend:** React, Vite, TailwindCSS, React Router, Recharts, MediaPipe (Client-side AI)
* **Backend:** Python, Django, Django REST Framework, SimpleJWT
* **Database:** PostgreSQL / SQLite (Development)
* **Payments:** Stripe API
* **Version Control:** Git, GitHub

---

## ⚙️ Installation & Setup Guide

To run this project locally, follow these steps:

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* PostgreSQL (Optional for local dev, SQLite is used by default)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/TalentTap.git
cd TalentTap
```

### 2. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create a superuser (Admin)
python manage.py createsuperuser

# Start the Django server
python manage.py runserver
```
*The backend API will run on `http://localhost:8000`*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend application will run on `http://localhost:5173`*

### 4. Environment Variables
You will need to configure your environment variables. Create a `.env` file in the `backend` directory with your database credentials, Django Secret Key, and Stripe API keys.

---

## 📄 Licensing & Copyright
**© 2026 Hafiz Muhammad Ishtiaq. All Rights Reserved.**

*This project was developed as a Final Year Project (FYP) for the Department of Computer Science, University of Agriculture, Faisalabad.*

This source code is the intellectual property of the author. It is strictly prohibited to copy, distribute, or reproduce this code for commercial purposes without explicit permission. The repository is initially public for academic evaluation but will transition to a private SaaS product post-graduation.

---

**Developed with ❤️ by Hafiz Muhammad Ishtiaq**
