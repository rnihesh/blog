import Link from "next/link";
import type { BlogPost } from "@/lib/posts";

interface RelatedPostsProps {
  posts: BlogPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-semibold mb-6">Related Posts</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.name}
            href={`/${post.name}`}
            className="group block p-4 rounded-lg border border-border hover:border-foreground/20 transition-colors"
          >
            <h3 className="font-medium text-foreground group-hover:underline mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.excerpt}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <time dateTime={post.date}>{post.date}</time>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
