# TalentTap AI - Technical Documentation

This document provides a comprehensive overview of the technical architecture, setup instructions, and deployment strategies for the TalentTap platform.

## Architecture Overview

TalentTap uses a decoupled monorepo architecture:
1. **Backend API (Django):** Acts as the central brain. Handles database operations, authentication (JWT), background tasks (Celery/Redis), payment processing (Stripe), and orchestrates LLM calls.
2. **Frontend SPA (React):** A fast, responsive, single-page application that consumes the Django REST API. It handles routing locally and maintains state using React Context and custom hooks.

---

## 1. Local Development Setup

### 1.1 Backend Setup (Windows/Linux/Mac)
Navigate to the `backend` directory:
```bash
cd backend
```

**Create and Activate Virtual Environment:**
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

**Install Dependencies:**
```bash
pip install -r requirements.txt
```
*(Note: It is standard practice to freeze your dependencies in production, but for development, `requirements.txt` contains the necessary packages without hard-locked versions unless specified).*

**Environment Variables:**
Create a `.env` file in the `backend/` directory (where `manage.py` is located) with the following essential variables:
```ini
DEBUG=True
SECRET_KEY=your-django-secret-key
GROQ_API_KEY=your-groq-key
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-stripe-webhook
```

**Run Migrations & Start Server:**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### 1.2 Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
```

**Install Dependencies:**
```bash
npm install
```

**Environment Variables:**
Create a `.env` file in the `frontend/` directory:
```ini
VITE_API_URL=http://localhost:8000/api
```

**Start Development Server:**
```bash
npm run dev
```

---

## 2. API & Integration Details

### Authentication Flow
- The platform uses JWT (JSON Web Tokens).
- `POST /api/auth/login/` returns `access` and `refresh` tokens.
- The React frontend stores the tokens in `localStorage` and attaches the `access` token as an `Authorization: Bearer <token>` header to all subsequent requests.

### AI Integration (Groq/OpenAI)
- The backend utilizes the `Groq` Python SDK to communicate with open-source models (like LLaMA-3).
- Prompts are defined dynamically in services (e.g., `apps/candidates/services.py`, `apps/interviews/services.py`).
- Responses are often streamed back to the frontend using `StreamingHttpResponse` in Django and the native `fetch` API on the frontend, parsed chunk-by-chunk for real-time UI updates (e.g., `streamFetch.js`).

---

## 3. GitHub Push & Version Control Guide

### What to Ignore (`.gitignore`)
A `.gitignore` file is crucial so you do not push sensitive data, large compiled binaries, or local environment files to GitHub. The project already contains a configured `.gitignore`. 

**Critical exclusions:**
- `backend/venv/`, `frontend/node_modules/` (Dependencies are easily re-installed)
- `backend/.env`, `frontend/.env` (Contains sensitive API keys and secrets)
- `backend/db.sqlite3` (Local database)
- `backend/media/` (User uploads)
- `__pycache__`, `.DS_Store` (System artifacts)

### Professional Commit Workflow
To push your code to GitHub professionally:

1. **Initialize Git (if not already done):**
   ```bash
   git init
   ```
2. **Check your Status:**
   ```bash
   git status
   ```
3. **Stage all changes (respecting `.gitignore`):**
   ```bash
   git add .
   ```
4. **Commit with a professional message:**
   ```bash
   git commit -m "chore: Prepare v1.0 architecture and finalize full-stack refactoring"
   ```
5. **Add your remote repository:**
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   ```
6. **Push to the main branch:**
   ```bash
   git push -u origin main
   ```

---

## 4. Production Deployment Strategy (AWS)

To deploy the backend on AWS, AWS needs to know where your code is and how to run it.

### Step 1: AWS EC2 (Virtual Server)
1. **Provision an EC2 Instance** (Ubuntu is recommended).
2. **SSH into the server** and install Python, pip, Nginx, and Git.
3. **Pull the Code:** You will clone your GitHub repository directly onto the AWS server:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name/backend
   ```
4. **Environment Setup:** You must manually recreate your `.env` file on the server since it was ignored by Git.

### Step 2: Gunicorn and Systemd
Django's `runserver` is not for production. You must use `Gunicorn`:
```bash
pip install gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```
You will configure a `systemd` service to keep Gunicorn running continuously in the background.

### Step 3: Nginx Reverse Proxy
Nginx will be configured to listen on port 80 (HTTP) and 443 (HTTPS), forwarding traffic to your Gunicorn process running on port 8000, and serving your `static` and `media` files directly for performance.

### Frontend Deployment (Vercel / Netlify / AWS Amplify)
The React frontend is best deployed to a CDN-backed service like Vercel or AWS Amplify.
1. Connect your GitHub repository to the platform.
2. Set the Root Directory to `frontend`.
3. Set the Build Command to `npm run build`.
4. Set the Output Directory to `dist`.
5. Add the environment variable `VITE_API_URL` pointing to your deployed AWS EC2 backend IP or domain (e.g., `https://api.talenttap.com/api`).
