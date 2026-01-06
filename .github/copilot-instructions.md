# GitHub Copilot Instructions for Blog Repository

## Project Overview

This is a modern blog application built with Next.js 16 App Router, React 19, TypeScript, and Tailwind CSS v4. The blog features markdown-based content management with support for GitHub Flavored Markdown (GFM), dark/light theme support, and a clean, minimalist design.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode enabled)
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4 with custom theme configuration
- **Content**: Markdown files with gray-matter frontmatter
- **Markdown Rendering**: react-markdown with remark-gfm and rehype-raw
- **Code Highlighting**: react-syntax-highlighter
- **Theme Management**: next-themes with system theme detection
- **Icons**: lucide-react

## Project Structure

```
blog/
├── app/                    # Next.js App Router
│   ├── [name]/            # Dynamic route for blog posts
│   │   └── page.tsx       # Individual blog post page
│   ├── layout.tsx         # Root layout with metadata and providers
│   ├── page.tsx           # Homepage with blog listing
│   ├── globals.css        # Global styles and markdown styling
│   └── sitemap.ts         # Sitemap generation
├── components/            # React components
│   ├── ui/               # UI components (buttons, etc.)
│   ├── analytics.tsx     # Analytics component
│   ├── code-block.tsx    # Code syntax highlighting
│   ├── theme-provider.tsx # Theme context provider
│   └── theme-toggle.tsx  # Theme toggle button
├── lib/                   # Utility functions
│   ├── posts.ts          # Blog post data management
│   └── utils.ts          # Utility functions
├── content/              # Markdown blog posts
│   └── *.md             # Individual blog post files
└── public/              # Static assets
```

## Development Commands

- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Code Style and Conventions

### TypeScript

- Use strict TypeScript mode (enabled in tsconfig.json)
- Define proper interfaces for all data structures
- Use type imports: `import type { ... }`
- Path aliases: Use `@/` for imports (e.g., `@/components/...`)

### React/Next.js

- Use React Server Components by default (Next.js 16 App Router)
- Mark client components with `"use client"` directive only when needed
- Use Next.js built-in features (Image, Link, Metadata API)
- Follow Next.js App Router conventions for routing and layouts

### Styling

- Use Tailwind CSS utility classes for all styling
- Follow the custom theme defined in `tailwind.config.ts`
- Use CSS variables for theming (defined in `globals.css`)
- Color palette uses HSL values with CSS custom properties
- Support both light and dark themes with `dark:` prefix
- Use semantic color names: `background`, `foreground`, `muted`, `accent`, `border`, etc.

### Components

- Place reusable UI components in `components/ui/`
- Place feature-specific components in `components/`
- Use composition and component variants when appropriate
- Prefer functional components with hooks

### Content Management

- Blog posts are stored as Markdown files in `content/` directory
- Each post has YAML frontmatter with required fields:
  - `title`: Post title
  - `author`: Author name
  - `date`: Publication date (YYYY-MM-DD format)
  - `dateModified`: Modified date (YYYY-MM-DD format, optional - defaults to `date` if not provided)
  - `excerpt`: Short description
  - `tags`: Array of tags
- The `dateModified` field is used in SEO metadata (JSON-LD, OpenGraph) but not displayed on frontend
- File name (without .md) becomes the URL slug
- Use `gray-matter` to parse frontmatter
- Posts are sorted by date in descending order

### Publishing Blog Posts

Blog posts can be created in three ways:

1. **Manual file creation**: Create `.md` files directly in `content/` directory
2. **GitHub Actions Workflow**: Use "Publish Blog Post" workflow in Actions tab with manual dispatch
3. **Issue-based publishing**: Create an issue using the "📝 Publish Blog Post" template

All methods validate the blog post structure before committing.

### Naming Conventions

- Use kebab-case for file names: `theme-toggle.tsx`
- Use PascalCase for component names: `ThemeToggle`
- Use camelCase for functions and variables: `getAllPosts`
- Use UPPER_CASE for environment variables: `NEXT_PUBLIC_SITE_URL`

### Imports

- Group imports: React/Next.js first, then third-party, then local
- Use path aliases: `@/components`, `@/lib`
- Example order:
  ```typescript
  import type { Metadata } from "next";
  import Link from "next/link";
  import { ComponentName } from "third-party-lib";
  import { LocalComponent } from "@/components/local-component";
  import { utilFunction } from "@/lib/utils";
  ```

## SEO and Metadata

- Use Next.js Metadata API for all pages
- Include comprehensive metadata (title, description, keywords, OG tags, Twitter cards)
- Add JSON-LD structured data for blog posts
- Use semantic HTML for accessibility
- Include proper alt text for images

## Testing

Currently, there is no test infrastructure in this repository. When adding tests:
- Consider using Jest and React Testing Library
- Test critical user flows and components
- Maintain existing functionality

## Common Tasks

### Adding a New Blog Post

1. Create a new `.md` file in `content/` directory
2. Add frontmatter with required fields (title, author, date, excerpt, tags)
3. Write content using GitHub Flavored Markdown
4. File name becomes the URL: `my-post.md` → `/my-post`

### Adding a New Component

1. Create component file in appropriate directory
2. Use TypeScript with proper types
3. Add `"use client"` if component uses hooks/interactivity
4. Style with Tailwind CSS utilities
5. Export as default or named export

### Modifying Styles

1. Prefer Tailwind utility classes
2. For custom styles, use CSS variables defined in `globals.css`
3. Ensure dark mode support with `dark:` prefix
4. Test in both light and dark themes

## Important Notes

- The blog uses file-based content management (no CMS or database)
- All routes are statically generated at build time
- Theme switching is handled client-side with next-themes
- Code blocks support syntax highlighting for multiple languages
- The site is optimized for SEO with proper metadata and structured data

## Environment Variables

- `NEXT_PUBLIC_SITE_URL` - Base URL for the site (default: https://blog.niheshr.com)

## Build and Deploy

- Static site generation (SSG) is used for all pages
- Run `npm run build` to generate production build
- Output is optimized for deployment on Vercel or any static hosting

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
