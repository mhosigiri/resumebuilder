# Resume Builder Dashboard

Modern resume builder with a single-page dashboard, Firebase Authentication, Firestore persistence, AI-powered parsing/tailoring via OpenRouter, and export-ready PDF generation. The UI enforces three professional templates (chronological, simple, professional) with strict typography and grayscale palettes.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript, Material UI, Zustand, React Hook Form patterns, pdf-lib for downloads.
- **Backend**: Node.js + Express 5, Multer for uploads, OpenRouter for AI (Llama 70B Vision, Llama 8B text, Llama 70B text).
- **Cloud**: Firebase Authentication & Firestore (users collection → resumes subcollection). Resume schema mirrors Firestore data for seamless reads/writes.

## Directory Layout

```
frontend/   # React SPA (dashboard, forms, Firebase client)
server/     # Express API for AI parsing/tailoring/layout generation
```

## Prerequisites

- Node.js 20+
- Firebase project with Email/Password + Google OAuth enabled
- Firestore (in Native mode)
- OpenRouter API key with access to the Llama models listed above

## Firestore Data Model

- `users/{uid}`
  - `email`, `createdAt`
  - Subcollection `resumes/{resumeId}` stores the entire `ResumeData` object defined in `frontend/src/types/resume.ts`.  
    - Personal info fields (`firstName`, `lastName`, etc.) map to `resume.personalInformation`.
    - Repeatable sections (workExperience, education, projects, etc.) are arrays of objects with IDs so they can be edited independently.
    - `resumeSettings.sectionOrder` and `resumeSettings.sectionsVisibility` keep the dashboard UI in sync with Firestore.

Every form input in the dashboard writes to a matching Firestore field, so exporting/importing data remains lossless.

## Environment Variables

### Frontend

Copy `frontend/env.example` to `frontend/.env` and populate:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_API_BASE_URL=http://localhost:4000/api
```

### Backend

Copy `server/env.example` to `server/.env`:

```
PORT=4000
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
APP_BASE_URL=http://localhost:5173
OPENROUTER_APP_NAME=ResumeBuilder
CORS_ORIGINS=http://localhost:5173
```

Never expose the OpenRouter key in the frontend—only the Express server talks to OpenRouter.

## Installation & Development

```bash
# Install frontend deps
cd frontend
npm install

# Install backend deps
cd ../server
npm install
```

### Run Locally

```bash
# Backend (Express + OpenRouter proxy)
cd server
npm run dev

# Frontend (Vite + React)
cd ../frontend
npm run dev
```

The Vite dev server proxies `/api/*` to `http://localhost:4000` so the frontend can call the Express routes without extra config.

## Express API (server)

| Endpoint | Purpose |
| --- | --- |
| `POST /api/parse-file` | Upload PDF/image resume → parses via Llama 70B Vision → returns normalized `ResumeData`. |
| `POST /api/parse-text` | Paste resume text → parsed with Llama 8B text model. |
| `POST /api/job-match` | Tailors a resume to a job description using Llama 8B, returns updated resume + `.txt` content. |
| `POST /api/generate-resume` | Formats the resume per selected template using Llama 70B text, returns preview text + updated data. |

All responses conform to the `ResumeData` schema so the frontend can store them directly in Firestore.

## Features Recap

- Firebase Auth (email/password + Google OAuth) and Firestore persistence.
- Resume importer (PDF/image/text) that hydrates every form field automatically.
- Repeatable sections for work history, education, projects, certifications, publications, OSS, awards, languages, volunteer work, memberships, and references.
- Resume settings panel with template switching, grayscale palette, professional fonts, section order drag-and-drop, and visibility toggles.
- Job matching assistant that injects keywords responsibly and saves the tailored `.txt`.
- AI formatter + PDF export via pdf-lib. Templates strictly follow professional fonts (Arial, Times New Roman, Calibri) and monochrome palettes.
- All OpenRouter calls are server-side; API keys never touch the browser.

## Deployment Tips

- **Frontend**: deploy to Vercel/Firebase Hosting. Set the same `VITE_*` env vars in the hosting provider.
- **Backend**: deploy to Render, Railway, Fly.io, or Firebase Functions. Remember to set the OpenRouter/Firebase origins in `server/.env`.
- Configure HTTPS domains in Firebase Auth for production.

## Testing Suggestions

- Create a test Firebase project to isolate dev data.
- Use the dashboard import feature with anonymized real resumes to validate parser accuracy.
- Confirm that each AI endpoint responds within your hosting timeout—OpenRouter latency can vary with large PDFs.

Enjoy building secure, ATS-friendly resumes!
