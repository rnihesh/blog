import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  getAllPosts,
  getPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
} from "@/lib/posts";
import rehypeRaw from "rehype-raw";
import { CodeBlock } from "@/components/code-block";
import { BlogPostImage } from "@/components/blog-post-image";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
import {
  MobileTableOfContents,
  DesktopTableOfContents,
} from "@/components/table-of-contents";
import { LinkableHeading } from "@/components/linkable-heading";
import { RelatedPosts } from "@/components/related-posts";
import { ReadingProgress } from "@/components/reading-progress";
import { ShareButtons } from "@/components/share-buttons";
import { PostNavigation } from "@/components/post-navigation";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

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

  const relatedPosts = getRelatedPosts(blog.name, blog.tags, 3);
  const { prev, next } = getAdjacentPosts(blog.name);
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
    image: [blogImage],
    author: {
      "@type": "Person",
      name: blog.author,
      url: "https://niheshr.com/",
    },
    datePublished: `${blog.date}T00:00:00+05:30`,
    dateModified: `${blog.date}T00:00:00+05:30`,
    url: blogUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogUrl,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Nihesh's Blog",
      url: siteUrl,
    },
    keywords: blog.tags.join(", "),
    publisher: {
      "@type": "Person",
      name: "Nihesh Rachakonda",
      url: "https://niheshr.com/",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress />

      {/* Desktop ToC - fixed to right side of viewport, doesn't affect content */}
      <DesktopTableOfContents content={blog.body} />

      <div className="min-h-screen">
        <div className="mx-auto px-4 pt-7 pb-10 max-w-3xl">
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
                <span className="mx-2">•</span>
                <span>{blog.readingTime} min read</span>
              </address>

              <div className="flex flex-wrap items-center justify-between gap-3">
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
                <ShareButtons url={blogUrl} title={blog.title} />
              </div>
            </header>

            {blog.image && (
              <BlogPostImage
                lightImage={blog.image}
                darkImage={blog.imageDark}
                alt={blog.title}
              />
            )}

            <MobileTableOfContents content={blog.body} />

            <div className="markdown-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h2({ children }: any) {
                    const text = String(children);
                    const id = slugify(text);
                    return (
                      <LinkableHeading id={id} level={2}>
                        {children}
                      </LinkableHeading>
                    );
                  },
                  h3({ children }: any) {
                    const text = String(children);
                    const id = slugify(text);
                    return (
                      <LinkableHeading id={id} level={3}>
                        {children}
                      </LinkableHeading>
                    );
                  },
                  h4({ children }: any) {
                    const text = String(children);
                    const id = slugify(text);
                    return (
                      <LinkableHeading id={id} level={4}>
                        {children}
                      </LinkableHeading>
                    );
                  },
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

            <RelatedPosts posts={relatedPosts} />

            <PostNavigation prev={prev} next={next} />

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
          </article>
        </div>
      </div>
      <Footer />
    </>
  );
}
