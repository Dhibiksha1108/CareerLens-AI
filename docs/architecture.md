# CareerLens AI — System Architecture & Design Specification

**Formal Title**: CareerLens AI: An Intelligent Career Profile Analysis and Recommendation Platform

## Executive Overview

CareerLens AI is a full-stack profile analysis and intelligent recommendation engine designed for Computer Science & Engineering students and professionals. It aggregates multi-source evidence (Resumes, Portfolios, GitHub repositories, Project artifacts) and compares them against target job descriptions to produce actionable skill-gap insights and personalized learning roadmaps.

## 3-Tier Microservices Architecture Flow

```text
  ┌─────────────────────────────────────────────────────────────┐
  │                   React + Vite + TS Frontend                 │
  └──────────────────────────────┬──────────────────────────────┘
                                 │ HTTP REST API
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                 Express.js + TypeScript API                  │
  │     (Auth, Business Logic, Route Controllers, Services)      │
  └──────────────┬───────────────────────────────┬──────────────┘
                 │                               │
    Mongoose ORM │                               │ HTTP JSON RPC
                 ▼                               ▼
  ┌──────────────────────────────┐ ┌───────────────────────────┐
  │        MongoDB Database      │ │   Python AI/NLP Service   │
  │  (Profiles, Resumes, Jobs,   │ │ (SpaCy, Transformers, LLM │
  │   Evidences, Roadmaps)       │ │  Parsing & Gap Analysis)  │
  └──────────────────────────────┘ └───────────────────────────┘
```

## System Workflow Pipeline

1. **Analyze**: Ingestion of raw inputs (Resumes, GitHub user repos, Portfolios, Projects, Target Job Descriptions).
2. **Verify**: Extraction of verified skills through multi-source evidence aggregation (`SkillEvidence`).
3. **Identify Gaps**: Algorithmic comparison of candidate skill vectors against target job requirements (`JobAnalysis`).
4. **Recommend**: Targeted project and learning recommendations prioritized by urgency (`Recommendation`).
5. **Improve**: Progressive step-by-step career path tracking (`CareerRoadmap`).

## Modular Component Overview

### Backend Modules (`backend/src/`)
- **Config**: Database parameters and typed environment options (`config/`).
- **Models**: Mongoose schema definitions for all 9 domain entities (`models/`).
- **Services**: Pure business logic and database CRUD operations (`services/`).
- **Controllers**: Express HTTP request/response handlers (`controllers/`).
- **Routes**: REST endpoint routing hierarchy (`routes/`).
- **Middleware**: Authentication (JWT), global error handling, and 404 router (`middleware/`).

### Frontend Modules (`frontend/src/`)
- **Pages**: Modular route views matching core capabilities (`pages/`).
- **Components**: Reusable UI primitives, Navigation, Layout wrappers (`components/`).
- **Services**: Axios/Fetch API client and domain-specific endpoints (`services/`).
- **Types**: Shared TypeScript interfaces for request/response payloads (`types/`).
