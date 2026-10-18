# AGENTS.md

Instructions for coding agents working in this repository. This is the single source of truth; tool-specific files import or point at it.

## Build & Development Commands

```bash
npm run dev              # Dev server at localhost:3000
npm run build            # Production build (SSG)
npm start                # Serve the production build
npm run verify           # typecheck + lint + validate posts + build. The gate CI runs.
npm run typecheck        # tsc --noEmit
npm run lint             # eslint . (Next 16 removed `next lint`)
npm run lint:fix         # eslint . --fix
npm run format           # prettier --write .
npm run test:blog-posts  # Validate blog post frontmatter
```

Before claiming a change works, run `npm run verify` and read the output.

## Architecture

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4

**Content System**: Markdown files in `content/` with YAML frontmatter. File name becomes URL slug (`my-post.md` → `/my-post`). Required frontmatter: `title`, `author`, `date` (YYYY-MM-DD), `excerpt`, `tags[]`.

**Key Directories**:
- `app/` - Next.js App Router pages and layouts
- `app/[name]/page.tsx` - Dynamic blog post route (SSG via `generateStaticParams`)
- `components/` - React components; `ui/` subdirectory for shadcn-style primitives
- `lib/posts.ts` - Post fetching (`getAllPosts`, `getPostBySlug`, `getRelatedPosts`, `getAdjacentPosts`)
- `content/` - Markdown blog posts
- `public/images/` - Theme-aware images: `{slug}.png|.jpg|.jpeg` (light), `{slug}-dark.png|.jpg|.jpeg` (dark)

**Rendering Pipeline**: gray-matter (frontmatter) → react-markdown + remark-gfm + rehype-raw → CodeBlock component (react-syntax-highlighter)

**Blog Post Features**:
- Table of Contents (`table-of-contents.tsx`): Desktop sidebar, mobile dropdown. Auto-generated from h2-h4 headers.
- Reading Progress (`reading-progress.tsx`): Thin progress bar at top showing scroll position.
- Linkable Headers (`linkable-heading.tsx`): Hover to copy direct link to section.
- Share Buttons (`share-buttons.tsx`): X/Twitter, LinkedIn, copy link.
- Related Posts (`related-posts.tsx`): Shows posts with matching tags.
- Post Navigation (`post-navigation.tsx`): Previous/next post links.

**Theme System**: next-themes with class-based dark mode. CSS variables (HSL) in `globals.css`. Use `dark:` prefix for dark mode styles.

## Blog Post Structure

Create markdown files in `content/` with this structure:

```markdown
---
title: "Post Title"
author: "Author Name"
date: "2026-01-15"
excerpt: "Brief description for listing and SEO"
tags: ["tag1", "tag2"]
---

# Content starts here

Your markdown content...
```

**Frontmatter Requirements**:
- All five fields (`title`, `author`, `date`, `excerpt`, `tags`) are required
- `date` must be YYYY-MM-DD format
- `tags` is an array of strings

**Supported Markdown** (GitHub Flavored Markdown):
- Headers, bold, italic, strikethrough
- Code blocks with syntax highlighting (specify language after opening ```)
- Ordered/unordered lists, blockquotes
- Tables, links, inline code
- Raw HTML via rehype-raw

**Images**: Place in `public/images/`. For theme-aware images, provide both `{slug}.png|.jpg|.jpeg` (light) and `{slug}-dark.png|.jpg|.jpeg` (dark).
Inline images in a post follow the same convention: next to `/images/{slug}/shot.webp`, a `shot-dark.webp` is shown in dark mode (`components/markdown-image.tsx`). Post images get rounded corners and a hairline border from `globals.css`.

**Validation**: Run `npm run test:blog-posts` to check frontmatter structure. GitHub Actions runs this automatically on push/PR.

## Code Conventions

Most conventions here are enforced mechanically, so they are not repeated as prose.
If you break one, a hook or the linter tells you immediately.

**Enforced automatically by tooling in this repo** (do not restate these in
instruction files):

| Rule | Enforced by |
| --- | --- |
| Blog frontmatter completeness | `scripts/validate-blog-posts.js`, run by `npm run verify` and CI |
| `@/` path aliases over `../` imports | `no-restricted-imports` in `eslint.config.mjs` |
| Formatting | Prettier (`npm run format`) |
| Types, unused vars, React rules | `eslint.config.mjs` and `npm run typecheck` |

**Conventions checked only by local tooling.** The author keeps agent-side hooks in
`.claude/` and `scripts/hooks/`, both gitignored, so these are not enforced on a fresh
clone or in CI. Follow them anyway:

- kebab-case file names
- No emojis in code or docs
- No em dashes or en dashes. Use a comma, colon, full stop, or parentheses instead.
  The `nextjs-agent-rules` block below is exempt; `next dev` rewrites it every run.

**Judgement calls** (the reason this section still exists):

- Server Components are the default. Reach for `"use client"` only when the file
  needs state, effects, browser APIs, or event handlers.
- Style with Tailwind utilities and semantic color names (`background`, `foreground`,
  `muted`, `accent`, `border`) rather than raw values.
- Colour variables in `globals.css` hold complete colour values (`oklch(...)`), not
  bare HSL triplets. Do not wrap them in `hsl()`. That was a past bug that silently
  dropped borders and text colours.
- Import order: React/Next.js, then third-party, then local `@/`.

## Agent enforcement

`CLAUDE.md` imports this file, so both stay in sync by construction. Hooks live in `.claude/settings.json` and
`scripts/hooks/`; path-scoped guidance lives in `.claude/rules/`. All of that is
gitignored and local to the author's machine, so treat it as convention, not as a gate
you can rely on.

The rule of thumb for this file: if a capable model would do it anyway, leave it out.
If it must always hold, make it a hook, a lint rule, or a test instead of a sentence.

## Environment Variables

```
NEXT_PUBLIC_SITE_URL=https://blog.niheshr.com  # Used for canonical URLs, SEO
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
