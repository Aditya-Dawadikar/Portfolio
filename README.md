# Portfolio

Personal portfolio website built with Next.js, TypeScript and Tailwind CSS.

Features
- Home page with About, Work, and Education sections
- Dedicated pages for Skills, Projects, Hackathons, and Blog
- Project cards that support image or embedded video (YouTube) with autoplay muted for embeds
- Blog listing sourced from `src/data/blog-links.ts` (external Medium links)
- Hackathon timeline entries with result badges (winner/participant)

Local development

Install dependencies and run the dev server:

```bash
pnpm install
pnpm dev
```

Build for production:

```bash
pnpm build
pnpm start
```

Data
- Edit `src/data/resume.tsx` to update projects, skills, work, and hackathons.
- Edit `src/data/blog-links.ts` to manage external blog entries (title, href, date, category).

