# CareerLens AI — REST API Endpoints Specification

All API responses follow a standard envelope format:

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

Error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {}
}
```

---

## Endpoint Summary

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new user
* `POST /api/auth/login` — Authenticate user and receive JWT
* `POST /api/auth/logout` — Logout user (clear session/token)
* `GET /api/auth/me` — Get current logged-in user profile

### User Profile (`/api/users`)
* `GET /api/users/profile` — Get user detailed profile
* `PUT /api/users/profile` — Update user profile details
* `PUT /api/users/target-roles` — Update target job roles & key skills

### Resume Analysis (`/api/resume`)
* `POST /api/resume/upload` — Upload/submit resume text & metadata
* `GET /api/resume/me` — Get current user's analyzed resume records
* `DELETE /api/resume/:id` — Delete a resume record

### Portfolio Analysis (`/api/portfolio`)
* `POST /api/portfolio/analyze` — Submit portfolio URL for content extraction
* `GET /api/portfolio/me` — Get portfolio extraction results

### GitHub Integration (`/api/github`)
* `POST /api/github/sync` — Sync GitHub repositories and language stats
* `GET /api/github/me` — Get user GitHub metrics and analyzed skills

### Projects Showcase (`/api/projects`)
* `POST /api/projects` — Create/add project artifact
* `GET /api/projects` — Get all user projects
* `GET /api/projects/:id` — Get single project details
* `PUT /api/projects/:id` — Update project details
* `DELETE /api/projects/:id` — Delete project

### Job Description Analysis (`/api/jobs`)
* `POST /api/jobs/analyze` — Analyze job description against candidate profile
* `GET /api/jobs` — Get list of analyzed jobs
* `GET /api/jobs/:id` — Get specific job analysis details

### Skill Evidence & Matrix (`/api/skills`)
* `GET /api/skills/evidence` — Fetch multi-source skill evidence items
* `POST /api/skills/verify` — Re-calculate skill evidence strength scores

### Smart Recommendations (`/api/recommendations`)
* `GET /api/recommendations` — Fetch personalized improvement recommendations
* `PATCH /api/recommendations/:id/status` — Update recommendation status (e.g. completed)

### Career Roadmap (`/api/roadmap`)
* `GET /api/roadmap` — Fetch user career roadmap
* `POST /api/roadmap/generate` — Request new roadmap generation for target role
* `PATCH /api/roadmap/stage/:stageId` — Update stage completion status

### Career Benchmarking (`/api/benchmarking`)
* `GET /api/benchmarking` — Compare candidate metrics against industry/peer benchmarks

### Career Simulator (`/api/simulator`)
* `POST /api/simulator/simulate` — Simulate role match percentage with hypothetical added skills/projects
