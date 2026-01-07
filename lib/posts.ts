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
      };
    });

  // Sort posts by date in descending order
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
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
    };
  } catch (error) {
    return undefined;
  }
}
