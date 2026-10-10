# CareerLens AI
### An Intelligent Career Profile Analysis and Recommendation Platform

<p align="center">
  <strong>Analyze → Verify → Identify Gaps → Recommend → Improve</strong>
</p>

<p align="center">
  An intelligent career analysis and recommendation platform designed for Computer Science and Engineering (CSE) students and technology professionals.
</p>

<p align="center">
  <a href="https://careerlens-ai-sxvt.onrender.com">
    <img src="https://img.shields.io/badge/🚀_LIVE_DEMO-Launch_CareerLens_AI-00A878?style=for-the-badge" alt="Live Demo">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black" alt="Render">
</p>

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Core Workflow](#-core-workflow)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Local Installation](#-local-installation)
- [API Overview](#-api-overview)
- [Deployment](#-deployment)
- [Project Objective](#-project-objective)
- [Developer](#-developer)

---

## 📌 About the Project

CareerLens AI is an intelligent career profile analysis and recommendation platform designed for CSE students and technology professionals.

It analyzes available resume information, skills, technical projects, and target job requirements to help users understand their current capabilities and identify opportunities for career improvement.

## 🔄 Core Workflow

<p align="center">
  <strong>Analyze → Verify → Identify Gaps → Recommend → Improve</strong>
</p>

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>📄 Resume Analysis</h3>
      Extract resume text, identify technical skills, and analyze resume content.
    </td>
    <td width="50%">
      <h3>🎯 ATS & Readability</h3>
      Evaluate resume compatibility, readability, and content quality.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💼 Job Compatibility</h3>
      Compare resumes with job descriptions and identify matching and missing skills.
    </td>
    <td width="50%">
      <h3>🧠 Skills & Evidence</h3>
      Track skills, identify gaps, and connect competencies with available evidence.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🚀 Projects & Portfolio</h3>
      Showcase technical projects and associate them with relevant technologies and skills.
    </td>
    <td width="50%">
      <h3>💡 Career Recommendations</h3>
      Discover suitable career roles and receive prioritized improvement recommendations.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🗺️ Career Roadmaps</h3>
      Explore role-specific learning paths, milestones, and practical projects.
    </td>
    <td width="50%">
      <h3>📊 Career Benchmarking</h3>
      Compare technical competencies against target-role expectations.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📈 Progress Tracking</h3>
      Monitor learning milestones, skill acquisition, and project progress.
    </td>
    <td width="50%">
      <h3>⚡ Improvement Simulator</h3>
      Simulate potential improvements and compare projected career alignment.
    </td>
  </tr>
</table>

---

## 🏗️ System Architecture

CareerLens AI uses a React frontend, a Node.js and Express backend, and MongoDB for persistent data storage.

```text
┌──────────────────────────────┐
│        React + Vite          │
│         Frontend UI          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Node.js + Express        │
│          REST API            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│      Persistent Storage      │
└──────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router |
| Icons | Lucide React |
| Visualizations | Recharts |
| Animations | Framer Motion |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB |
| Authentication | JWT, bcrypt |
| NLP & Analysis | Text preprocessing, TF-IDF, cosine similarity |
| Application Hosting | Render |
| Database Hosting | MongoDB Atlas |
| Version Control | Git, GitHub |

---

## 📂 Repository Structure

The current application uses a unified frontend and backend setup.

```text
CareerLens-AI/
├── src/                  # Frontend and client-side services
├── server.ts             # Express server entry point
├── server/               # Backend routes, services, models and configuration
├── package.json          # Dependencies and application scripts
├── vite.config.ts        # Vite configuration
└── README.md             # Project documentation
```

---

## ⚙️ Local Installation

### Prerequisites

- Node.js
- npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Dhibiksha1108/CareerLens-AI.git
cd CareerLens-AI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Add the environment variables required by your application:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_secret
```

Replace the example values with your own configuration.

**Security:** Never commit your `.env` file, database credentials, or JWT secret to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### 5. Build the Application

```bash
npm run build
```

### 6. Start the Production Server

```bash
npm start
```

---

## 🔌 API Overview

CareerLens AI provides backend functionality for:

- **Authentication:** Registration, login, and JWT sessions.
- **User Profiles:** Profile management and target career roles.
- **Resume Analysis:** Resume upload, text extraction, and analysis.
- **Skills & Evidence:** Skill extraction and competency evidence.
- **Projects:** Technical project and portfolio management.
- **Job Compatibility:** Job-description matching and skill-gap analysis.
- **Recommendations:** Career-role and learning recommendations.
- **Roadmaps:** Role-specific learning paths and milestones.
- **Benchmarking:** Career readiness and technical competency comparisons.
- **Dashboard:** Career analytics and progress insights.
- **Simulator:** Career improvement simulations.

Refer to the application's server routes for the exact endpoints and supported operations.

---

## ☁️ Deployment

CareerLens AI is deployed using Render, with MongoDB Atlas providing cloud database storage.

| Component | Platform |
|---|---|
| Application Hosting | Render |
| Database | MongoDB Atlas |
| Source Code | GitHub |

### 🌐 Live Application

<p align="center">
  <a href="https://careerlens-ai-sxvt.onrender.com">
    <img src="https://img.shields.io/badge/OPEN_LIVE_APPLICATION-CareerLens_AI-00A878?style=for-the-badge" alt="Open CareerLens AI">
  </a>
</p>

**Live URL:** https://careerlens-ai-sxvt.onrender.com

> **Note:** The application is hosted on Render's free tier. The first request after inactivity may take some time to load.

---

## 🎯 Project Objective

CareerLens AI aims to help students and technology professionals understand their technical capabilities, identify skill gaps, and make informed career-development decisions.

By combining resume analysis, skill evidence, job compatibility, career recommendations, benchmarking, and progress visualization, the platform provides a structured approach to career improvement.

---

## 👩‍💻 Developer

**Dhibiksha**

- **GitHub Profile:** [Dhibiksha1108](https://github.com/Dhibiksha1108)
- **Project Repository:** [CareerLens AI](https://github.com/Dhibiksha1108/CareerLens-AI)
- **Live Demo:** [Launch CareerLens AI](https://careerlens-ai-sxvt.onrender.com)

---

<p align="center">
  <strong>CareerLens AI — A clearer perspective for a brighter career.</strong>
</p>
