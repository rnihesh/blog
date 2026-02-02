# GitHub Copilot Instructions

## Commands

```bash
npm run dev              # Dev server at localhost:3000
npm run build            # Production build (SSG)
npm run lint             # ESLint
npm run format           # Prettier
npm run test:blog-posts  # Validate blog post frontmatter
```

## Architecture

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4

**Content System**: Markdown files in `content/` with YAML frontmatter. File name becomes URL slug (`my-post.md` → `/my-post`).

**Key Files**:
- `app/[name]/page.tsx` - Dynamic blog post route (SSG via `generateStaticParams`)
- `lib/posts.ts` - Post fetching (`getAllPosts`, `getPostBySlug`, `getRelatedPosts`, `getAdjacentPosts`)
- `components/` - React components; `ui/` subdirectory for shadcn-style primitives
- `public/images/` - Theme-aware images: `{slug}.png` (light), `{slug}-dark.png` (dark)

**Rendering Pipeline**: gray-matter → react-markdown + remark-gfm + rehype-raw → CodeBlock (react-syntax-highlighter)

**Theme**: next-themes with class-based dark mode. CSS variables (HSL) in `globals.css`. Use `dark:` prefix for dark variants.

## Blog Post Format

```markdown
---
title: "Post Title"
author: "Author Name"
date: "2026-01-15"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
---

Content here...
```

All five frontmatter fields are required. Run `npm run test:blog-posts` to validate.

## Code Conventions

- Server Components by default; add `"use client"` only when needed
- Path aliases: `@/components`, `@/lib`
- File names: kebab-case (`theme-toggle.tsx`)
- Components: PascalCase (`ThemeToggle`)
- Imports order: React/Next.js → third-party → local (`@/`)
- No emojis in code, docs, or commits; use Unicode symbols (✔, ✖)
- Tailwind utilities only; semantic color names (`background`, `foreground`, `muted`, `accent`, `border`)
