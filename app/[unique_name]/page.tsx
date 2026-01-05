import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import blogs from "../../blogs.json";

interface BlogPageProps {
  params: Promise<{
    unique_name: string;
  }>;
}

export async function generateStaticParams() {
  return blogs.map((blog) => ({
    unique_name: blog.unique_name,
  }));
}

export async function generateMetadata({ params }: BlogPageProps) {
  const resolvedParams = await params;
  const blog = blogs.find((b) => b.unique_name === resolvedParams.unique_name);

  if (!blog) {
    return {
      title: "Blog Not Found",
    };
  }

  return {
    title: blog.title,
    description: blog.excerpt,
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const resolvedParams = await params;
  const blog = blogs.find((b) => b.unique_name === resolvedParams.unique_name);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
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
              <span>{blog.date}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded bg-muted text-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: () => null, // Skip H1 as it's already shown in the header
                pre({ node, children, ...props }: any) {
                  return <pre {...props}>{children}</pre>;
                },
                code({ node, inline, className, children, ...props }: any) {
                  return inline ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : (
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

        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors text-base"
          >
            View All Posts →
          </Link>
        </div>
      </div>
    </div>
  );
}
