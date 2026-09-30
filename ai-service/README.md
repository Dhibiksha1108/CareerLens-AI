# CareerLens AI - Python AI/NLP Service

FastAPI-based microservice for resume parsing, skill extraction, candidate-job matching, and roadmap recommendation models.

## Architecture & Integration Flow

```text
React Frontend ──(REST/JSON)──> Express Backend API ──(HTTP/JSON)──> AI/NLP Microservice
                                      │                                      │
                                      └────────────> MongoDB <───────────────┘
```

## Setup Instructions

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## Planned Endpoints (Phase 2+)

* `POST /api/v1/analyze-resume` — Extracts skills, experience, and education from resume raw text or PDF.
* `POST /api/v1/extract-skills` — Performs NLP entity extraction on text snippets.
* `POST /api/v1/match-job` — Computes semantic similarity between user profile and job description.
* `POST /api/v1/recommend-roadmap` — Generates personalized learning paths based on skill gap vectors.
