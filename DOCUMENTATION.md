# TalentTap - Technical Documentation

This document serves as the in-depth technical manual for the TalentTap platform, intended for future developers, maintainers, and system administrators. For quick setup and installation instructions, please refer to the `README.md`.

## 1. System Architecture Details

The system is deployed across a decoupled Three-Tier architecture, utilizing containerization and RESTful communication.

### 1.1 Frontend (Presentation Layer)
* **Framework:** React.js powered by Vite for rapid HMR (Hot Module Replacement).
* **State Management:** React Context API paired with custom hooks (`useAuth`, `useNotifications`) to avoid prop-drilling.
* **Styling:** TailwindCSS utilizing a bespoke "Glassmorphism" UI design system. Component styles are strictly utility-first to ensure performance.
* **Routing:** `react-router-dom` utilizing protected routes for Role-Based Access Control (Candidate vs. Recruiter vs. Admin views).

### 1.2 Backend (Business Logic Layer)
* **Framework:** Django 5.x utilizing the Django REST Framework (DRF).
* **Authentication:** Stateless authentication via SimpleJWT. Tokens are securely passed via HTTP headers and stored securely on the client.
* **File Handling:** Django signals process profile pictures, resumes, and media via AWS S3 / Cloudinary configurations.
* **Webhooks:** Stripe is integrated natively. A dedicated webhook endpoint listens for `checkout.session.completed` events to automatically upgrade company subscription tiers.

### 1.3 AI Systems
* **Matching Algorithm:** The `engine.py` script tokenizes text from Candidate Profiles and Job Descriptions, utilizing NLP similarity matrices to output a percentage match score.
* **Anti-Cheat Video System:** Utilizes Google's MediaPipe Face Mesh model executing directly on the client's browser (React). If the user leaves the frame or multiple faces are detected, the system immediately voids the interview session and updates the backend database.

## 2. API Schema Overview

All API endpoints require a valid Bearer Token for access unless stated otherwise.

### Authentication Endpoints
* `POST /api/accounts/register/` - Register a new user (Candidate/Company)
* `POST /api/accounts/login/` - Returns Access and Refresh JWTs
* `POST /api/accounts/refresh/` - Refresh an expired Access token

### Job Management Endpoints
* `GET /api/jobs/` - Fetch all active job listings
* `POST /api/jobs/` - (Company Only) Create a new job posting
* `GET /api/jobs/<id>/matches/` - (Company Only) Trigger the AI Matching Engine to rank applicants for a specific job

### Candidate Application Endpoints
* `POST /api/applications/` - Apply to a job posting
* `GET /api/applications/me/` - Retrieve all applications for the logged-in candidate

## 3. Database Schema (PostgreSQL)

The database strictly adheres to Third Normal Form (3NF). Core models include:
* **User:** Extended AbstractUser handling dual roles (`is_candidate`, `is_company`).
* **CompanyProfile:** Contains Stripe `customer_id` and subscription status.
* **Job:** Foreign Key mapped to `CompanyProfile`. Contains text vectors for matching.
* **Application:** The junction table between `User` and `Job`. Tracks `match_score` and `status` (Pending, Interviewing, Hired, Rejected).

## 4. Deployment Strategy

* **Frontend:** Configured for Vercel/Netlify. Run `npm run build` to generate the static `dist/` directory.
* **Backend:** Configured for AWS EC2/Render. Utilize `gunicorn core.wsgi:application` to serve the application in production. Ensure `DEBUG=False` in the `.env` file before deployment.
* **Database Management:** Run `python manage.py collectstatic` and `python manage.py migrate` upon every CI/CD deployment pipeline.
