import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { ThemeToggle } from "@/components/theme-toggle";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.niheshr.com";

export default function Home() {
  const blogs = getAllPosts();

  // JSON-LD structured data for the blog listing page
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Nihesh's Blog",
    description:
      "Technical articles, tutorials, and thoughts on web development, DevOps, and software engineering.",
    url: siteUrl,
    author: {
      "@type": "Person",
      name: "Nihesh Rachakonda",
      url: "https://niheshr.com",
    },
    blogPost: blogs.map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.excerpt,
      datePublished: `${blog.date}T00:00:00+05:30`,
      url: `${siteUrl}/${blog.name}`,
      author: {
        "@type": "Person",
        name: blog.author,
        url: "https://niheshr.com",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 pt-7 pb-12 max-w-3xl">
          <header className="mb-16">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-bold">Nihesh's Blog</h1>
              <div className="ml-4">
                <ThemeToggle />
              </div>
            </div>
            <p className="text-muted-foreground mt-2">
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
                      className="text-xs py-1 rounded text-foreground"
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
    </>
  );
}
