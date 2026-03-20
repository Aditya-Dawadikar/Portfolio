# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint (next lint)
```

No test suite is configured.

## Architecture

Next.js 14 App Router portfolio site with TypeScript, Tailwind CSS, and Framer Motion.

### Data Flow

All portfolio content lives in **`src/data/resume.tsx`** — this is the single source of truth for skills, projects, work history, education, hackathons, and personal info. Updating content means editing this file. External blog/Medium links are in `src/data/blog-links.ts`.

### Routing

The landing page (`/`) is a cinematic dark-themed hero page. The main portfolio content lives under `/home` and sub-routes:

| Route | Content |
|---|---|
| `/home` | About, Work, Education |
| `/projects` | Project cards with images/video embeds |
| `/skills` | Skills listing |
| `/hackathons` | Timeline with winner/participant badges |
| `/blog` | Sourced from `src/data/blog-links.ts` (external Medium links) |
| `/blog/[slug]` | MDX content from `/content/` directory |
| `/papers` | Research papers |
| `/stories` | Case studies |
| `/ai-engineering`, `/frontend-resources`, `/system-design-library` | Curated resource pages |

### API Routes

- `GET /api/activity` — Fetches live GitHub & LeetCode activity via `src/lib/activityService.ts`
- `GET /api/readme?url=<encoded>` — Proxies a raw GitHub README URL through `src/lib/readmeCache.ts`, which caches responses on the **server filesystem** (`.cache/readmes/` in the project root, falling back to `os.tmpdir()` in read-only serverless environments). Default TTL is 30 seconds. Concurrent fetches for the same URL are deduplicated in-process. Stale cache is served if the remote fetch fails.

### Resource Page Caching (`/frontend-resources`, `/system-design-library`, `/ai-engineering`)

These are client-side pages that fetch a GitHub README via `/api/readme`. They implement a **two-layer cache**:

1. **Server cache** (`src/lib/readmeCache.ts`) — filesystem-based, 30s TTL, shared across all requests to the same server instance.
2. **Client cache** (`localStorage`) — keyed by the raw GitHub URL (`readme:<url>`). On client-side navigation the cached string is rendered immediately (no network request). On a full page reload (`performance.getEntriesByType("navigation")[0].type === "reload"`) the cache is bypassed and a fresh fetch is made, then the result is written back to `localStorage`.

To add a new resource page, create a new route under `src/app/`, point it at the raw README URL of the source GitHub repo, and reuse the same `fetch → localStorage` pattern.

### Component Organization

- `src/components/ui/` — shadcn/ui primitives (button, card, badge, etc.) — do not edit manually, use shadcn CLI
- `src/components/magicui/` — animation components (BlurFade, Dock)
- `src/components/` root — feature components (navbar, project-card, my-activity, hackathon-card, etc.)

### Styling

- Tailwind CSS with CSS variables (HSL) for theming — colors defined in `src/app/globals.css`
- Dark mode via `class` strategy, toggled by `mode-toggle.tsx` / `theme-provider.tsx`
- Path alias `@/*` maps to `src/*`

### Key Patterns

- `PageWrapper` wraps most pages for consistent layout/padding
- `BlurFade` from magicui is used for staggered entrance animations throughout
- Project cards support either a static image or a YouTube embed (autoplay, muted)
- Blog uses a hybrid approach: MDX files in `/content/` for hosted posts, external links from `blog-links.ts` for Medium posts
