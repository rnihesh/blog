import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "@/components/code-block";

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

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: blog.tags,
    authors: [{ name: blog.author }],
    openGraph: {
      type: "article",
      locale: "en_US",
      url: blogUrl,
      siteName: "Nihesh's Blog",
      title: blog.title,
      description: blog.excerpt,
      publishedTime: blog.date,
      authors: [blog.author],
      tags: blog.tags,
      images: [
        {
          url: "/nihesh.png",
          width: 512,
          height: 512,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: ["/nihesh.png"],
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

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
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
        <div className="container mx-auto px-4 py-10 max-w-3xl ">
          <Link
            href="/"
            className="inline-block text-foreground hover:underline mb-8 font-medium"
          >
            ← Back to all posts
          </Link>

          <article>
            <header className="mb-8">
              <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <span>{blog.author}</span>
                <span className="mx-2">•</span>
                <time dateTime={blog.date}>{blog.date}</time>
              </div>
              <div className="flex flex-wrap gap-3">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs py-1 rounded bg-muted text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

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
