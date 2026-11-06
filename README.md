# ContentOps AI

A content operations platform for planning, creating, scheduling and measuring social media content across several channels. It has an Express and TypeScript API, a React dashboard and a PostgreSQL database, and runs with Docker Compose.

## What it does

- Manages accounts, channels and content items, each with AI-generated variations
- Schedules and publishes posts through per-platform adapters, with OAuth for connecting accounts
- Tracks analytics and estimates return on investment, with a forecasting service
- Generates content with a pluggable LLM provider
- Secures the API with JWT access and refresh tokens, hashed passwords, rate limiting, request validation and encrypted account tokens
- Dashboard pages for the overview, content manager, scheduler and analytics

## Tech stack

- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, Joi, Helmet
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Tooling: Docker Compose, Jest

## Run it locally

```
docker compose up --build
```

The API runs on port 8000 and the dashboard on port 5173. The compose file ships with development-only values for the database password and JWT secrets. Replace them with your own secrets before any real deployment, and never commit real secrets.

## Project layout

- `src/controllers`, `src/routes` and `src/services`: the API, split by feature
- `src/middleware`: authentication, rate limiting, validation and error handling
- `prisma`: the schema and migrations, covering accounts, channels, content, variations, posts and analytics
- `frontend`: the React dashboard
