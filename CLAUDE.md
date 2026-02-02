# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev           # Start dev server at localhost:3000
npm run build         # Production build (SSG)
npm start             # Start production server
npm run lint          # Run ESLint via Next.js
npm run format        # Format with Prettier
npm run test:blog-posts  # Validate blog post frontmatter
```

## Architecture

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4

**Content System**: Markdown files in `content/` with YAML frontmatter. File name becomes URL slug (`my-post.md` → `/my-post`). Required frontmatter: `title`, `author`, `date` (YYYY-MM-DD), `excerpt`, `tags[]`.

**Key Directories**:
- `app/` - Next.js App Router pages and layouts
- `app/[name]/page.tsx` - Dynamic blog post route (SSG via `generateStaticParams`)
- `components/` - React components; `ui/` subdirectory for shadcn-style primitives
- `lib/posts.ts` - Post fetching (`getAllPosts`, `getPostBySlug`, `getRelatedPosts`, `getAdjacentPosts`)
- `content/` - Markdown blog posts
- `public/images/` - Theme-aware images: `{slug}.png` (light), `{slug}-dark.png` (dark)

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

**Images**: Place in `public/images/`. For theme-aware images, provide both `{slug}.png` (light) and `{slug}-dark.png` (dark).

**Validation**: Run `npm run test:blog-posts` to check frontmatter structure. GitHub Actions runs this automatically on push/PR.

## Code Conventions

- Server Components by default; add `"use client"` only when needed
- Path aliases: `@/components`, `@/lib`
- File names: kebab-case (`theme-toggle.tsx`)
- Components: PascalCase (`ThemeToggle`)
- Imports order: React/Next.js → third-party → local (`@/`)
- No emojis in code, docs, or commits; use Unicode symbols (✔, ✖) when needed
- Tailwind utilities only for styling; semantic color names (`background`, `foreground`, `muted`, `accent`, `border`)

## Environment Variables

```
NEXT_PUBLIC_SITE_URL=https://blog.niheshr.com  # Used for canonical URLs, SEO
```
