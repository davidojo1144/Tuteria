# Tuteria Email Workflow Dashboard

A full-stack implementation to compose and trigger emails via an automation workflow service, built with:

- Frontend: Next.js App Router (TypeScript) + Tailwind CSS
- Backend: Django (Python)

## Overview

- Responsive Compose Email UI with your provided design (dark/light, Plus Jakarta Sans, Material Symbols).
- Client toolbar for simple formatting (bold, italic, underline, list, link, code) using Markdown/HTML snippets.
- Tracks opens/clicks toggles and “Save Draft” using localStorage.
- Frontend API route proxies to Django backend, which calls your workflow service.
- Dev-safe fallback: when workflow base URL/API key are not configured, backend returns a stub “queued” success to keep local UX smooth.
- Toast notifications: top-right, slide-in animation. Success toast shows a concise confirmation. Error toasts show details.

## Project Structure

- Frontend (Next.js): `frontend/`
  - UI page: [send-mail](file:///Users/bellfast/Documents/trae_projects/Tuteria/frontend/app/workflows/send-mail/page.tsx)
  - API proxy: [route.ts](file:///Users/bellfast/Documents/trae_projects/Tuteria/frontend/app/api/send-email/route.ts)
  - Layout and fonts/icons: [layout.tsx](file:///Users/bellfast/Documents/trae_projects/Tuteria/frontend/app/layout.tsx)
  - Toast system: [Toast.tsx](file:///Users/bellfast/Documents/trae_projects/Tuteria/frontend/app/components/Toast.tsx)
  - Tailwind config: [tailwind.config.cjs](file:///Users/bellfast/Documents/trae_projects/Tuteria/frontend/tailwind.config.cjs)
  - PostCSS config: [postcss.config.mjs](file:///Users/bellfast/Documents/trae_projects/Tuteria/frontend/postcss.config.mjs)
  - Global CSS: [globals.css](file:///Users/bellfast/Documents/trae_projects/Tuteria/frontend/app/globals.css)
- Backend (Django): `backend/`
  - Workflow utility with env-safe fallback: [workflow_email.py](file:///Users/bellfast/Documents/trae_projects/Tuteria/backend/workflow/utils/workflow_email.py)
  - HTTP endpoint: [views.py](file:///Users/bellfast/Documents/trae_projects/Tuteria/backend/workflow/views.py)
  - Settings/URLs: [settings.py](file:///Users/bellfast/Documents/trae_projects/Tuteria/backend/backend/settings.py), [urls.py](file:///Users/bellfast/Documents/trae_projects/Tuteria/backend/backend/urls.py)

## Quick Start

Prerequisites:

- Node.js 18+ and npm
- Python 3.9+ and pip

Frontend:

1. `cd frontend`
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000/workflows/send-mail

Backend:

1. `pip install -r backend/requirements.txt`
2. `python backend/manage.py migrate`
3. `python backend/manage.py runserver 0.0.0.0:8000`

## Environment Configuration

Frontend (optional):

- `NEXT_PUBLIC_BACKEND_BASE_URL` — override backend base URL (defaults to http://localhost:8000)
- `NEXT_PUBLIC_WEBSITE_URL` — used to build referral_tracking_page_url (defaults to https://medbuddyafrica.com)
- `NEXT_PUBLIC_ENV` — not required; UI defaults to staging on submit

Backend (required for real sends):

- `AUTOMATION_WORKFLOW_BASE_URL` — e.g. `https://your-workflow-host`
- `AUTOMATION_WORKFLOW_API_KEY` — API key for workflow service
- `AUTOMATION_WORKFLOW_WEBHOOK_SECRET` — optional signing secret
- `ENVIRONMENT` — `staging` or `production`
- `WEBSITE_URL` — e.g. `https://medbuddyafrica.com`

Dev-safe fallback:

- If `AUTOMATION_WORKFLOW_BASE_URL` is empty or contains `workflow.example.com`, or API key is missing, the backend returns:
  ```
  { ok: true, queued: true, id: <uuid>, environment: <env>, echo: <payload> }
  ```
  No external request is made.

## Routes

- Frontend page: `/workflows/send-mail`
- Frontend proxy: `POST /api/send-email` → Backend `POST /api/workflows/send-mail`
- Backend to workflow service: `POST {base}/api/workflows/send-mail` with payload:
  ```
  {
    "template": "<slugified template>",
    "to": "<recipient>",
    "from": "Medbuddy <info@medbuddyafrica.com>",
    "context": {
      "subject_line": "<subject>",
      "email_body": "<markdown/plaintext>",
      "track_opens": <bool>,
      "track_clicks": <bool>,
      "referral_tracking_page_url": "<website>/app/referrals",
      "recipient": "<recipient>"
    },
    "environment": "staging"
  }
  ```

## Styling

- Tailwind theme:
  - Colors: `primary`, `background-light`, `background-dark`
  - Fonts: Plus Jakarta Sans
  - Icons: Material Symbols Outlined
- Dark mode: `class` strategy via `html.light` / `dark` classes
- Form enhancements: `@tailwindcss/forms`
- Container queries: `@tailwindcss/container-queries`

## Toast Notifications

- Placement: Top-right with slide-in animation
- Success: “Email Sent” and concise message
- Error: “Failed” or “Network error” with details
- Minimal, no CTA (configurable if needed)

## Development Notes

- Next.js runs dev server on 3000; will switch ports automatically if occupied.
- Favicon is not included; the 404 is harmless. Add one in `frontend/public/` if desired.
- Next.js manages TypeScript JSX transform; tsconfig is adjusted automatically by Next dev server.

## Git

- Remote: `https://github.com/davidojo1144/Tuteria.git`
- Branch: `main`
