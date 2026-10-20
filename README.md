# RoadResQ Frontend

The web application frontend for **RoadResQ** — an on-demand roadside assistance platform connecting stranded motorists with nearby mechanics.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS v4 & Vanilla CSS Variables
- **UI Components:** shadcn/ui
- **State & Data Fetching:** `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`
- **Icons & Visuals:** `lucide-react`, `recharts`

## Backend Integration

- **Backend Repository:** [RoadResQ Backend](https://github.com/tasifhossan/RoadResQ-backend)
- **Live Backend API:** [RoadResQ API v1](https://road-res-q-backend.vercel.app/api/v1)

## Environment Variables

Configure environment variables in `.env.local` (validated via `src/lib/env.ts` using Zod):

| Variable | Type | Requirement | Usage & Description | Default / Example |
|---|---|---|---|---|
| `BACKEND_URL` | Runtime (Server-only) | Optional (has fallback) | Target URL for backend REST API proxy calls | `https://road-res-q-backend.vercel.app/api/v1` |
| `DEMO_PASSWORD` | Runtime (Server-only) | Optional | Password for demo role logins on auth endpoints | `DemoPassword123!` |
| `GEMINI_API_KEY` | Runtime (Server-only) | Optional | API key from Google AI Studio for server-side AI features | None (empty by default) |
| `GEMINI_MODEL` | Runtime (Server-only) | Optional (has fallback) | Primary Gemini model identifier | `gemini-2.5-flash-lite` |
| `GEMINI_FALLBACK_MODEL` | Runtime (Server-only) | Optional | Fallback model if primary model returns 404 or fails | None (empty by default) |
| `NEXT_PUBLIC_SITE_URL` | Build-time (Public) | Optional (has fallback) | Canonical base URL for SEO metadata & sitemap generation | `http://localhost:3000` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Build-time (Public) | Optional | Contact email address for contact page mailto link | None (empty by default) |
| `NEXT_PUBLIC_LINKEDIN_URL` | Build-time (Public) | Optional | LinkedIn profile URL for footer social link | None (empty by default) |
| `NEXT_PUBLIC_DEVELOPER_NAME` | Build-time (Public) | Optional | Developer or entity name displayed on privacy policy | None (falls back to "the RoadResQ developer") |

> **AI & Privacy Notice:**
> - Obtain your API key from [Google AI Studio](https://aistudio.google.com/).
> - Free-tier rate limits and quotas are small.
> - On the free tier, prompts and responses may be logged and reviewed by Google to improve products. Therefore, personal data (names, emails, phone numbers) must **never** be sent to Gemini. All user-supplied inputs must be sanitized through `src/lib/ai/sanitize.ts` before transmission.
> - Server-side AI features gracefully degrade to rule-based fallbacks when the AI is unavailable or unconfigured.

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the production bundle.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint for code analysis.
