import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "@/components/code-block";
import { BlogPostImage } from "@/components/blog-post-image";
import { ThemeToggle } from "@/components/theme-toggle";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.niheshr.com";

interface BlogPageProps {
  params: Promise<{
    name: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    name: post.name,
  }));
}

export async function generateMetadata({ params }: BlogPageProps) {
  const resolvedParams = await params;
  const blog = getPostBySlug(resolvedParams.name);

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  const blogUrl = `${siteUrl}/${blog.name}`;

  // Use blog-specific image for SEO, fallback to default
  const blogImage = blog.image
    ? `${siteUrl}${blog.image}`
    : `${siteUrl}/nihesh.png`;

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: blog.tags,
    authors: [{ name: blog.author }],
    image: blogImage,
    openGraph: {
      type: "article",
      locale: "en_US",
      url: blogUrl,
      siteName: "Nihesh's Blog",
      title: blog.title,
      description: blog.excerpt,
      publishedTime: `${blog.date}T00:00:00+05:30`,
      authors: [blog.author],
      tags: blog.tags,
      images: [
        {
          url: blogImage,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: [blogImage],
    },
    alternates: {
      canonical: blogUrl,
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const resolvedParams = await params;
  const blog = getPostBySlug(resolvedParams.name);

  if (!blog) {
    notFound();
  }

  const blogUrl = `${siteUrl}/${blog.name}`;

  // Use blog-specific image for SEO, fallback to default
  const blogImage = blog.image
    ? `${siteUrl}${blog.image}`
    : `${siteUrl}/nihesh.png`;

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: blogImage,
    author: {
      "@type": "Person",
      name: blog.author,
      url: "https://niheshr.com",
    },
    datePublished: `${blog.date}T00:00:00+05:30`,
    dateModified: `${blog.date}T00:00:00+05:30`,
    url: blogUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogUrl,
    },
    keywords: blog.tags.join(", "),
    publisher: {
      "@type": "Person",
      name: "Nihesh",
      url: "https://niheshr.com",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/nihesh.png`,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 pt-7 pb-10 max-w-3xl ">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-block text-foreground hover:underline font-medium"
            >
              ← Back to all posts
            </Link>
            <ThemeToggle />
          </div>

          <article>
            <header className="mb-8">
              <h1 id="post-title" className="text-4xl font-bold mb-4">
                {blog.title}
              </h1>

              <address className="not-italic flex items-center text-muted-foreground mb-4">
                <span>{blog.author}</span>
                <span className="mx-2">•</span>
                <time dateTime={blog.date}>{blog.date}</time>
              </address>

              <div className="flex flex-wrap gap-3">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs py-1 rounded text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            {blog.image && (
              <BlogPostImage
                lightImage={blog.image}
                darkImage={blog.imageDark}
                alt={blog.title}
              />
            )}

            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");

                    if (!inline && match) {
                      return (
                        <CodeBlock language={match[1]}>
                          {String(children).replace(/\n$/, "")}
                        </CodeBlock>
                      );
                    }

                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {blog.body}
              </ReactMarkdown>
            </div>
          </article>

          <div className="mt-12 pt-8 border-t border-border flex justify-center">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-1 bg-primary text-primary-foreground px-4 py-3 rounded-md font-medium transition-colors text-base hover:underline"
            >
              <span>
                View All Posts
                <span className="inline-block transition-transform group-hover:translate-x-1 ">
                  →
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
