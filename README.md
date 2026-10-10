# CareerLens AI: An Intelligent Career Profile Analysis and Recommendation Platform

<p align="center">
  <strong>Analyze → Verify → Identify Gaps → Recommend → Improve</strong>
</p>

<p align="center">
  An intelligent career analysis and recommendation platform designed for Computer Science & Engineering (CSE) students and technology professionals.
</p>

<p align="center">
  <a href="https://careerlens-ai-sxvt.onrender.com">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-CareerLens_AI-00A878?style=for-the-badge" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/Frontend-React_19-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=nodedotjs" alt="Node.js">
  <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Deployment-Render-46E3B7?style=for-the-badge&logo=render" alt="Render">
</p>

---

## 🚀 Live Demo

**Explore CareerLens AI online:**

### 👉 [Launch CareerLens AI](https://careerlens-ai-sxvt.onrender.com)

CareerLens AI helps users analyze their career profiles, identify skill gaps, evaluate job compatibility, and discover personalized learning opportunities.

> **Note:** The application is hosted on Render's free tier. The first request after a period of inactivity may take some time to load.

---

## 📌 About the Project

CareerLens AI is an intelligent profile analysis and career recommendation platform designed specifically for CSE students and technology professionals.

It analyzes available resume information, verified skill evidence, projects, and target job requirements to provide career insights and actionable improvement recommendations.

## 🔄 Core Workflow

```text
Analyze → Verify → Identify Gaps → Recommend → Improve

✨ Key Features
📄 Resume Analysis
Upload resumes in supported formats.
Extract resume text and technical skills.
Analyze resume content and skill evidence.
🎯 ATS & Readability Analysis
Evaluate resume compatibility.
Analyze readability and content quality.
Identify areas for improvement.
💼 Job Compatibility
Compare resumes against target job descriptions.
Identify matching and missing skills.
Generate compatibility insights.
🧠 Skills & Evidence
Organize extracted and verified skills.
Identify skill gaps.
Connect technical competencies with available evidence.
🚀 Projects & Technical Portfolio
Showcase technical projects.
Associate projects with relevant technologies.
Connect project evidence with career skills.
💡 Career Recommendations
Explore suitable career roles.
Identify prioritized skill gaps.
Receive role-specific improvement recommendations.
🗺️ Career Roadmaps
Explore personalized learning roadmaps.
Organize learning goals and milestones.
Discover practical projects for skill development.
📊 Career Benchmarking & Analytics
Examine technical competency domains.
Compare skills against target-role expectations.
Visualize career readiness and improvement areas.
📈 Progress Tracking
Track roadmap milestones.
Monitor skill acquisition.
Follow project and portfolio progress.
⚡ Portfolio Improvement Simulator
Simulate potential skill improvements.
Explore the impact of projects and certifications.
Compare current and projected career alignment.
🏗️ System Architecture

CareerLens AI uses a React frontend, a Node.js and Express backend, and MongoDB for persistent data storage.
                 ┌─────────────────────────┐
                 │       React + Vite      │
                 │      Frontend UI        │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │   Node.js + Express     │
                 │       REST API          │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │        MongoDB          │
                 │    Persistent Storage   │
                 └─────────────────────────┘
🛠️ Technology Stack
Category	Technologies
Frontend	React 19, Vite, TypeScript
Styling	Tailwind CSS v4
Routing	React Router
Icons	Lucide React
Visualizations	Recharts
Animations	Framer Motion
Backend	Node.js, Express.js, TypeScript
Database	MongoDB
Authentication	JWT, bcrypt
NLP & Analysis	Text preprocessing, TF-IDF, cosine similarity
Deployment	Render
Database Hosting	MongoDB Atlas
Version Control	Git, GitHub

📂 Repository Structure

The current project uses a unified frontend and backend setup.

CareerLens-AI/
├── src/                  # React frontend and client-side services
├── server.ts             # Express server entry point
├── server/               # Backend routes, services, models and configuration
├── package.json          # Dependencies and application scripts
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
⚙️ Local Installation
Prerequisites

Install the following before running the project locally:

Node.js
npm
MongoDB Atlas account or a local MongoDB instance
Git
1. Clone the Repository
git clone https://github.com/Dhibiksha1108/CareerLens-AI.git
cd CareerLens-AI
2. Install Dependencies
npm install
3. Configure Environment Variables

Create a .env file in the project root.

Add the environment variables required by your application:

NODE_ENV=development
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret

Replace the example values with your actual configuration.

Security: Never commit your .env file, database credentials, or JWT secret to GitHub.

4. Start the Development Server
npm run dev

Open the local URL displayed in your terminal.

5. Build the Application
npm run build
6. Start the Production Server
npm start
🔌 REST API

CareerLens AI provides backend functionality for:

Authentication and JWT sessions
User profiles and target career roles
Resume upload and analysis
Skill extraction and evidence
Projects and portfolio management
Job compatibility and skill-gap analysis
Career recommendations
Learning roadmaps
Career benchmarking
Dashboard analytics
Career improvement simulations

Refer to the existing server routes for the exact endpoint paths and supported operations.

☁️ Deployment

CareerLens AI is deployed using Render, with MongoDB Atlas providing cloud database storage.

Component	Platform
Application	Render
Database	MongoDB Atlas
Source Code	GitHub
🌐 Live Application

https://careerlens-ai-sxvt.onrender.com

The application can be accessed directly through the live URL.

🎯 Project Objective

CareerLens AI aims to help students and technology professionals understand their current technical capabilities, identify skill gaps, and make informed career-development decisions.

By combining resume analysis, skill evidence, job compatibility, career recommendations, benchmarking, and progress visualization, the platform provides a structured approach to career improvement.

👩‍💻 Developer

Dhibiksha

GitHub Profile: Dhibiksha1108
Project Repository: CareerLens AI
Live Demo: Launch CareerLens AI
<p align="center"> <strong>CareerLens AI — A clearer perspective for a brighter career.</strong> </p> ```
