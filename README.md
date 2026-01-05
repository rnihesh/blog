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

- **JSON-based Content**: Blog posts stored in `blogs.json` for easy management

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
├── app/
│   ├── [name]/    # Dynamic route for individual blog posts
│   │   └── page.tsx
│   ├── globals.css       # Global styles and markdown styling
│   ├── layout.tsx        # Root layout component
│   └── page.tsx          # Homepage (blog listing)
├── blogs.json            # Blog post data
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Adding Blog Posts

To add a new blog post, edit the `blogs.json` file and add a new entry:

```json
{
  "name": "my-new-post",
  "title": "My New Post",
  "author": "Your Name",
  "date": "2026-01-03",
  "tags": ["tag1", "tag2"],
  "excerpt": "A short description of the post",
  "body": "# Title\n\nYour markdown content here..."
}
```

The `name` will be used as the URL path (e.g., `/my-new-post`).

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

## License

ISC
