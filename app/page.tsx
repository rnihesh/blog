import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const blogs = getAllPosts();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-2">My Blog</h1>
          <p className="text-muted-foreground">
            Welcome to my collection of thoughts and tutorials
          </p>
        </header>

        <div className="space-y-8">
          {blogs.map((blog) => (
            <article
              key={blog.name}
              className="border-b border-border pb-8 last:border-b-0"
            >
              <Link href={`/${blog.name}`} className="group">
                <h2 className="text-2xl font-bold mb-2 group-hover:underline">
                  {blog.title}
                </h2>
              </Link>
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <span>{blog.author}</span>
                <span className="mx-2">•</span>
                <span>{blog.date}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <p className="text-muted-foreground flex-1">{blog.excerpt}</p>
                <Link
                  href={`/${blog.name}`}
                  className="text-foreground hover:underline whitespace-nowrap font-medium"
                  aria-label={`Read more about ${blog.title}`}
                >
                  Read More →
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs py-1 rounded bg-muted text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
