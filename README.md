# RoadResQ Frontend

The web application frontend for **RoadResQ** — an on-demand roadside assistance platform connecting stranded motorists with nearby verified mechanics.

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
| `NEXT_PUBLIC_SITE_URL` | Build-time (Public) | Optional (has fallback) | Canonical base URL for SEO metadata & sitemap generation | `http://localhost:3000` |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Build-time (Public) | Optional | Contact email address for contact page mailto link | `developer@example.com` |

## Available Scripts

In the project directory, you can run:

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the production bundle.
- `npm run start`: Starts the Next.js production server.
- `npm run lint`: Runs ESLint for code analysis.
