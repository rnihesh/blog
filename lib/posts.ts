import fs from "fs";
import path from "path";
import matter from "gray-matter";

const contentDirectory = path.join(process.cwd(), "content");

export interface BlogPost {
  unique_name: string;
  title: string;
  author: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string;
}

export function getAllPosts(): BlogPost[] {
  const fileNames = fs.readdirSync(contentDirectory);
  const posts = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const unique_name = fileName.replace(/\.md$/, "");
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        unique_name,
        title: data.title,
        author: data.author,
        date: data.date,
        tags: data.tags || [],
        excerpt: data.excerpt,
        body: content,
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
      unique_name: slug,
      title: data.title,
      author: data.author,
      date: data.date,
      tags: data.tags || [],
      excerpt: data.excerpt,
      body: content,
    };
  } catch (error) {
    return undefined;
  }
}
