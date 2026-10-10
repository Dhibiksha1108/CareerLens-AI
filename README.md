CareerLens AI: An Intelligent Career Profile Analysis and Recommendation Platform
CareerLens AI is an intelligent profile analysis and career recommendation engine engineered for Computer Science & Engineering (CSE) students and tech professionals. It aggregates multi-source evidence—resumes, portfolios, GitHub repositories, and engineering projects—to provide granular skill gap insights, market compatibility benchmarks, and actionable career roadmaps.
📌 Table of Contents
Core Workflow
System Architecture
Repository Structure
Technology Stack
Key Features & Capabilities
Environment Variables
Installation & Quick Start
REST API Overview
Production & Cloud Deployment
Author & Maintenance
🔄 Core Workflow
code
Text
Analyze ──▶ Verify ──▶ Identify Gaps ──▶ Recommend ──▶ Improve
CareerLens AI continuously evaluates multi-source candidate credentials and transforms them into targeted career progression steps:
What CareerLens AI Evaluates
Resumes & Portfolios: Ingests PDF/DOCX resumes and portfolio sites with NLP parsing.
GitHub Repositories: Aggregates repo language distributions, commit activity, and code metrics.
Project Quality & Architecture: Validates production readiness, architecture, and technology stacks.
Skills & Evidence Verification: Correlates demonstrated skills across real-world artifacts.
Target Job Descriptions: Evaluates candidate skill profiles against industry role requirements.
What CareerLens AI Generates
Skill Evidence Matrix: Confidence scores categorized across verified competencies.
Granular Skill Gaps: Distinguishes required, matching, missing, and partially demonstrated skills.
Job Compatibility Benchmarks: Industry-calibrated readiness scores and peer comparisons.
Prioritized Recommendations: High-impact project and learning recommendations ranked by urgency.
Interactive Career Roadmaps & Simulator: Multi-stage roadmaps and "what-if" skill addition simulations.
🏗️ System Architecture
CareerLens AI employs a unified full-stack architecture with a microservices-ready structure:
code
Text
┌─────────────────────────────────────────────────────────────────┐
│                   React 19 + Vite + TS Frontend                 │
│              (Tailwind CSS v4, Recharts, Framer Motion)         │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP REST API
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Express.js + TypeScript API Gateway             │
│        (Auth, Business Logic, Route Controllers, Services)      │
└────────────────┬───────────────────────────────┬────────────────┘
                 │                               │
    Mongoose ORM │                               │ HTTP JSON RPC
                 ▼                               ▼
┌────────────────────────────────┐ ┌──────────────────────────────┐
│        MongoDB Database        │ │    Python AI/NLP Service     │
│   (Profiles, Resumes, Jobs,    │ │ (FastAPI, SpaCy, Transformers│
│    Evidences, Roadmaps, Auth)  │ │  Parsing & Gap Analysis)     │
└────────────────────────────────┘ └──────────────────────────────┘
📂 Repository Structure
code
Text
careerlens-ai/
├── src/                      # React 19 Frontend Application
│   ├── components/           # UI primitives, layout, sidebar, auth modals
│   ├── pages/                # Modular route views (Dashboard, Resume, Jobs, etc.)
│   ├── services/             # Axios/fetch API clients and endpoints
│   ├── types/                # Shared TypeScript interfaces
│   └── utils/                # Token management, formatters, helpers
├── server/                   # Express.js Backend Application
│   ├── config/               # Database connection and environment config
│   ├── controllers/          # HTTP request/response handlers
│   ├── middleware/           # JWT auth, error handlers, upload middleware
│   ├── models/               # Mongoose schema definitions (9 domain entities)
│   ├── routes/               # Modular REST API route handlers
│   └── services/             # Pure business logic and database CRUD
├── ai-service/               # Python FastAPI NLP & AI Microservice
│   ├── app/                  # FastAPI routers and ML service logic
│   └── requirements.txt      # Python dependencies
├── docs/                     # Technical Documentation
│   ├── api-specification.md  # Detailed REST API endpoint contracts
│   └── architecture.md       # 3-tier system architecture specification
├── .env.example              # Environment variables template
├── package.json              # Full-stack dependencies and NPM scripts
├── server.ts                 # Express entry point (Vite dev server & prod static SPA)
└── vite.config.ts            # Vite build configuration with Tailwind CSS v4
🛠️ Technology Stack
Layer	Technology	Purpose
Frontend Framework	React 19 + Vite 6	Modern, reactive user interface with high-performance bundling
Language	TypeScript 5	Strict static typing across frontend and backend services
Styling	Tailwind CSS v4	Utility-first responsive design and custom theming
Routing	React Router v7	Client-side routing and authenticated navigation shell
Data Visualization	Recharts v2	Interactive charts, radar benchmarks, and readiness metrics
Animations	Framer Motion v12	Fluid transitions, cards, and modal interactions
Iconography	Lucide React	Clean, consistent interface icons
Backend Runtime	Node.js (v20+ / v22)	High-throughput asynchronous server runtime
Server Framework	Express.js 4	REST API routing, middleware pipeline, static serving
TypeScript Execution	TSX	Native TypeScript execution in development and production
Database	MongoDB + Mongoose 8	Document database for profiles, evidence, and roadmaps
Authentication	JWT + Bcrypt.js	Stateless bearer authentication and secure password hashing
Document Processing	pdf-parse & mammoth	Resume parsing for PDF and DOCX file formats
AI Microservice	Python 3.10+ & FastAPI	NLP tokenization, SpaCy/transformer skill extraction
✨ Key Features & Capabilities
Interactive Dashboard: Real-time career readiness score, skill match index, market compatibility, and target role highlights.
Resume & ATS Analysis: Ingests resume files (PDF/DOCX), parses work history, extracts technical skills, and computes ATS compatibility scores.
Skills & Evidence Matrix: Multi-source evidence aggregation linking verified competencies back to GitHub repos, coursework, and projects.
Technical Portfolio & Projects: Full CRUD management of engineering projects with live links, GitHub URLs, and automatic skill mapping.
Job Matching & Gap Detection: Dynamic comparison against target roles (Full Stack Developer, Data Analyst, Backend Engineer, Data Engineer).
Targeted Recommendations: Prioritized project ideas and learning modules ranked by urgency and skill impact.
Career Roadmaps: Progressive milestone tracking organized into foundational, intermediate, and advanced career stages.
Benchmarking & Market Analytics: Peer and industry percentile comparisons for technical breadth, depth, and system design.
Improvement Simulator: "What-if" sandbox enabling users to project readiness gains by adding hypothetical skills or projects.
⚙️ Environment Variables
Create a .env file in the project root by copying the sample template:
code
Bash
cp .env.example .env
Variable Name	Required	Default / Example	Description
PORT	No	3000	Port for the Express backend server
NODE_ENV	No	development	Environment mode (development or production)
MONGO_URI	Yes	mongodb://127.0.0.1:27017/careerlens_db	MongoDB connection connection string (local or Atlas)
JWT_SECRET	Yes	your_secure_jwt_secret_key	Secret key for signing JSON Web Tokens
JWT_EXPIRES_IN	No	7d	Expiration window for authentication tokens
AI_SERVICE_URL	No	http://localhost:8000	Base URL of the optional Python AI microservice
OPENAI_API_KEY	No	sk-...	Optional API key for LLM-enhanced gap generation
🚀 Installation & Quick Start
Prerequisites
Node.js: v18.0.0 or higher (v20+ / v22 recommended)
MongoDB: Local MongoDB instance (mongod) or MongoDB Atlas URI
Python: 3.10+ (optional, required only for running the AI microservice)
1. Clone & Install Dependencies
code
Bash
git clone https://github.com/username/careerlens-ai.git
cd careerlens-ai
npm install
2. Configure Environment
code
Bash
cp .env.example .env
# Open .env and configure MONGO_URI and JWT_SECRET
3. Run Development Server
code
Bash
npm run dev
The application runs at http://localhost:3000 with Vite HMR middleware and the Express REST API mounted together.
4. Optional: Run Python AI Microservice
code
Bash
cd ai-service
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
The microservice runs at http://localhost:8000 with interactive Swagger documentation at http://localhost:8000/docs.
📜 REST API Overview
All API endpoints return standardized JSON response envelopes. Refer to docs/api-specification.md for complete payload schemas.
Authentication (/api/auth)
POST /api/auth/register — Register a new user account
POST /api/auth/login — Authenticate credentials and issue JWT
POST /api/auth/logout — Terminate user session
GET /api/auth/me — Retrieve current authenticated user profile
User Profile (/api/users)
GET /api/users/profile — Fetch detailed user profile and settings
PUT /api/users/profile — Update user profile details
PUT /api/users/target-roles — Update active target roles and key skills
Resume Analysis (/api/resume)
POST /api/resume/upload — Ingest resume file (PDF/DOCX) or plain text
GET /api/resume/me — Fetch user's analyzed resume records
DELETE /api/resume/:id — Remove an uploaded resume entry
Portfolio & GitHub (/api/portfolio, /api/github)
POST /api/portfolio/analyze — Analyze portfolio URL for project detection
GET /api/portfolio/me — Retrieve extracted portfolio insights
POST /api/github/sync — Synchronize GitHub repositories and language metrics
GET /api/github/me — Retrieve synced GitHub technical metrics
Technical Portfolio & Projects (/api/projects)
GET /api/projects — Fetch all user projects from MongoDB
POST /api/projects — Create a project entry with GitHub & live demo links
GET /api/projects/:id — Retrieve specific project details
PUT /api/projects/:id — Update project metadata, links, and technologies
DELETE /api/projects/:id — Delete a project artifact
Job Matching & Evidence (/api/jobs, /api/skills)
POST /api/jobs/analyze — Match candidate skills against target job description
GET /api/jobs — Retrieve history of analyzed jobs
GET /api/jobs/:id — Retrieve job match score and missing skill breakdown
GET /api/skills/evidence — Fetch multi-source skill evidence matrix
POST /api/skills/verify — Recompute skill evidence strength scores
Career Progression & Intelligence (/api/recommendations, /api/roadmap, /api/benchmarking, /api/simulator)
GET /api/recommendations — Fetch prioritized learning and project recommendations
PATCH /api/recommendations/:id/status — Update recommendation completion state
GET /api/roadmap — Fetch personalized multi-stage career roadmap
POST /api/roadmap/generate — Generate a new roadmap for selected target role
PATCH /api/roadmap/stage/:stageId — Toggle milestone completion status
GET /api/benchmarking — Retrieve role-specific peer and industry benchmarks
POST /api/simulator/simulate — Compute simulated readiness score with hypothetical skills
🚢 Production & Cloud Deployment
Deployment Matrix
Platform	Deployment Type	Build Command	Start Command
Render	Web Service (Node.js)	npm install && npm run build	npm start (or tsx server.ts)
Vercel / Netlify	Frontend SPA	npm run build	Static files in dist/
Docker / Container	Full-Stack Container	npm run build	npm start
Production Build Flow
In production (NODE_ENV=production), Express directly serves the compiled Vite assets from the dist/ directory and routes non-API routes to index.html:
code
Bash
# 1. Compile the production bundle
npm run build

# 2. Launch production server
npm start
👨‍💻 Author & Maintenance
Project: CareerLens AI
Repository: CareerLens AI GitHub Repository
Documentation: /docs
License: MIT
