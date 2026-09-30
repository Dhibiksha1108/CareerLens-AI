# CareerLens AI: An Intelligent Career Profile Analysis and Recommendation Platform

CareerLens AI is an intelligent profile analysis and career recommendation engine designed specifically for Computer Science & Engineering (CSE) students and tech professionals.

## Core Core Workflow

$$\text{Analyze} \longrightarrow \text{Verify} \longrightarrow \text{Identify Gaps} \longrightarrow \text{Recommend} \longrightarrow \text{Improve}$$

CareerLens AI evaluates user:
- Resumes & Portfolios
- GitHub Repositories & Language Stats
- Project Quality, Architecture, and Testing
- Skills & Evidence Verification
- Target Job Descriptions

It generates:
- Strengths & Skill Evidence Strengths
- Granular Skill Gaps (Required vs Matching vs Missing vs Partial)
- Job Compatibility Benchmarks
- Prioritized Project & Learning Recommendations
- Interactive Career Roadmaps & Readiness Simulations

---

## 🏗️ Repository Architecture

```text
CareerLens/
├── frontend/             # React + Vite + TypeScript + Tailwind CSS UI
├── backend/              # Node.js + Express.js + TypeScript REST API
├── ai-service/           # Python FastAPI NLP & AI Analysis Service (Microservice Skeleton)
├── docs/                 # System Architecture & API Specifications
├── .env.example          # Unified Environment Variables Blueprint
└── README.md             # Project Master Documentation
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v7
- **Icons**: Lucide React
- **Visualizations**: Recharts
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) + Bcrypt.js

### Microservices / AI
- **Framework**: Python FastAPI
- **Architecture**: `React → Express API → AI/NLP Service → MongoDB`

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or MongoDB Atlas URI)
- Python 3.10+ (for AI microservice)

### 1. Setup Backend
```bash
cd backend
cp ../.env.example .env
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### 3. Setup AI Service (Optional / Future Integration)
```bash
cd ai-service
python -m venv venv
# Windows: venv\Scripts\activate | Unix: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
AI Microservice runs on `http://localhost:8000`

---

## 📜 REST API Overview

- `/api/auth` — Authentication & JWT Session management
- `/api/users` — User profile management & target roles
- `/api/resume` — Resume file ingestion & text analysis
- `/api/portfolio` — Portfolio scraping & project detection
- `/api/github` — GitHub repository & contribution statistics sync
- `/api/projects` — Engineering project showcase & artifact analysis
- `/api/jobs` — Job description skill matching & gap analysis
- `/api/skills` — Multi-source skill evidence matrix & verification
- `/api/recommendations` — Prioritized learning & project recommendations
- `/api/roadmap` — Progressive career stage roadmaps
- `/api/benchmarking` — Peer & market compatibility benchmarks
- `/api/simulator` — Skill readiness simulator
