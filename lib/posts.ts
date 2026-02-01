import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content");
const imagesDirectory = path.join(process.cwd(), "public", "images");

export interface BlogPost {
  name: string;
  title: string;
  author: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string;
  image?: string;
  imageDark?: string;
  readingTime: number;
}

/**
 * Calculate reading time in minutes (average 200 words per minute)
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return Math.max(1, minutes);
}

/**
 * Find image for a blog post (case-insensitive for .png and .PNG)
 */
function findImage(name: string, isDark: boolean = false): string | undefined {
  const baseName = isDark ? `${name}-dark` : name;
  const extensions = [".PNG", ".png"];

  for (const ext of extensions) {
    const imagePath = path.join(imagesDirectory, `${baseName}${ext}`);
    if (fs.existsSync(imagePath)) {
      return `/images/${baseName}${ext}`;
    }
  }

  return undefined;
}

export function getAllPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(contentDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const name = fileName.replace(/\.md$/, "");
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        name,
        title: data.title,
        author: data.author,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt,
        body: content,
        image: findImage(name, false),
        imageDark: findImage(name, true),
        readingTime: calculateReadingTime(content),
      };
    });

  // Sort posts by date in descending order
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getAdjacentPosts(
  currentSlug: string
): { prev: BlogPost | null; next: BlogPost | null } {
  const allPosts = getAllPosts(); // Already sorted by date descending
  const currentIndex = allPosts.findIndex((post) => post.name === currentSlug);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  // prev = newer post (lower index), next = older post (higher index)
  const prev = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const next = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return { prev, next };
}

export function getRelatedPosts(
  currentSlug: string,
  tags: string[],
  limit: number = 3
): BlogPost[] {
  const allPosts = getAllPosts();

  // Score posts by number of matching tags
  const scored = allPosts
    .filter((post) => post.name !== currentSlug)
    .map((post) => {
      const matchingTags = post.tags.filter((tag) => tags.includes(tag)).length;
      return { post, score: matchingTags };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.post);
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
      name: slug,
      title: data.title,
      author: data.author,
      date: data.date,
      tags: data.tags || [],
      excerpt: data.excerpt,
      body: content,
      image: findImage(slug, false),
      imageDark: findImage(slug, true),
      readingTime: calculateReadingTime(content),
    };
  } catch (error) {
    return undefined;
  }
}
