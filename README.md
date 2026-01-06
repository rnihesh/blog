# Blog Application

A modern blog application built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Features dynamic routing, markdown rendering, and a clean responsive UI with dark/light theme support.

## Features

- **Markdown Support**: Full markdown rendering with support for:
  - **Bold** and _italic_ text
  - Code blocks with syntax highlighting (JavaScript, Python, Bash, etc.)
  - Lists (ordered and unordered)
  - Blockquotes
  - Links and more

- **Clean UI**: Minimalist design with:
  - Black and gray color scheme
  - Vertical blog listing layout
  - Large, accessible buttons
  - Smooth theme transitions

- **Theme Support**:
  - Light and dark mode
  - System theme detection
  - Theme toggle button

- **Next.js App Router**:
  - Server-side rendering
  - Static site generation
  - Dynamic routes for blog posts
  - SEO-friendly metadata

- **Markdown-based Content**: Blog posts stored as `.md` files in the `content/` directory with YAML frontmatter

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/rnihesh/blog.git
cd blog
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
blog/
├── .github/
│   ├── copilot-instructions.md  # GitHub Copilot coding agent instructions
│   └── workflows/               # GitHub Actions workflows
├── app/
│   ├── [name]/                  # Dynamic route for individual blog posts
│   │   └── page.tsx
│   ├── globals.css              # Global styles and markdown styling
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Homepage (blog listing)
├── components/                  # React components
│   ├── ui/                      # UI components (buttons, etc.)
│   ├── analytics.tsx
│   ├── code-block.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── content/                     # Markdown blog posts
│   └── *.md                     # Individual blog post files
├── lib/                         # Utility functions
│   ├── posts.ts                 # Blog post data management
│   └── utils.ts
├── public/                      # Static assets
├── scripts/                     # Utility scripts
│   └── validate-blog-posts.js  # Validates blog post markdown structure
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

## Adding Blog Posts

To add a new blog post, create a new `.md` file in the `content/` directory with YAML frontmatter:

```markdown
---
title: "My New Post"
author: "Your Name"
date: "2026-01-03"
excerpt: "A short description of the post"
tags: ["tag1", "tag2"]
---

# Title

Your markdown content here...
```

The file name (without `.md`) will be used as the URL path (e.g., `my-new-post.md` → `/my-new-post`).

### Validating Blog Posts

To ensure blog posts follow the correct structure, you can run:

```bash
npm run test:blog-posts
```

This validation script checks that each markdown file in `content/`:
- Starts with YAML frontmatter delimited by `---`
- Contains all required fields: `title`, `author`, `date`, `excerpt`, `tags`
- Has proper date format (YYYY-MM-DD)
- Includes blog content after the frontmatter

A GitHub Actions workflow automatically validates all blog posts when changes are pushed to the repository.

## Markdown Features

The blog supports GitHub Flavored Markdown (GFM) including:

- Headers (H1-H6)
- **Bold**, _italic_, and **_bold italic_** text
- ~~Strikethrough~~
- Inline `code`
- Code blocks with language syntax:
  ````markdown
  ```javascript
  console.log("Hello!");
  ```
  ````
- Lists (bulleted and numbered)
- Blockquotes
- Links

## Build and Deploy

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Technologies Used

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **react-markdown** - Markdown rendering
- **remark-gfm** - GitHub Flavored Markdown support

## GitHub Copilot Instructions

This repository includes comprehensive GitHub Copilot coding agent instructions in `.github/copilot-instructions.md`. These instructions help Copilot understand the project structure, tech stack, code conventions, and development workflow to generate better code suggestions.

## License

Licensed under the Apache License, Version 2.0.

© 2026 Nihesh Rachakonda
