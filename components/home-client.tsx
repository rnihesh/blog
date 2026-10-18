"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchCommand } from "@/components/search-command";
import { Pagination } from "@/components/pagination";
import { Footer } from "@/components/footer";
import { BlogPostImage } from "@/components/blog-post-image";
import { ViewTransitionLink } from "@/components/view-transition-link";
import {
  getPostAuthorTransitionName,
  getPostDateTransitionName,
  getPostImageTransitionName,
  getPostTagTransitionName,
  getPostTitleTransitionName,
} from "@/lib/view-transition-names";

const POSTS_PER_PAGE = 4;
const SCROLL_STORAGE_KEY = "home-scroll-position";

interface Post {
  name: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  tags: string[];
  image?: string;
  imageDark?: string;
}

interface HomeClientProps {
  blogs: Post[];
}

export function HomeClient({ blogs }: HomeClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(blogs.length / POSTS_PER_PAGE);

  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedBlogs = blogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

  // Save scroll position before navigating away
  useEffect(() => {
    const saveScrollPosition = () => {
      sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY));
    };

    // Save on any link click within the page
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link && link.href && !link.href.includes("?page=")) {
        saveScrollPosition();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Restore scroll position when coming back
  useEffect(() => {
    const savedPosition = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (savedPosition) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedPosition, 10));
      });
      // Clear after restoring so it doesn't restore on refresh
      sessionStorage.removeItem(SCROLL_STORAGE_KEY);
    }
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", String(page));
      }
      const query = params.toString();
      router.push(query ? `/?${query}` : "/", { scroll: true });
    },
    [router, searchParams],
  );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-7 pb-12 max-w-3xl">
        <header className="mb-10">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold">Nihesh&apos;s Blog</h1>
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>
          <p className="text-muted-foreground mt-2">
            Welcome to my collection of thoughts and tutorials
          </p>
        </header>

        {/* Search bar */}
        <div className="mb-10">
          <SearchCommand posts={blogs} />
        </div>

        <div className="space-y-8">
          {paginatedBlogs.map((blog) => (
            <article
              key={blog.name}
              aria-labelledby={`post-${blog.name}`}
              className="border-b border-border pb-8 last:border-b-0"
            >
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <h2
                    id={`post-${blog.name}`}
                    className="text-2xl font-bold mb-2"
                    style={
                      {
                        "--vt-name": getPostTitleTransitionName(blog.name),
                      } as React.CSSProperties
                    }
                  >
                    <ViewTransitionLink
                      href={`/${blog.name}`}
                      className="group"
                    >
                      <span className="group-hover:underline">
                        {blog.title}
                      </span>
                    </ViewTransitionLink>
                  </h2>

                  <address className="not-italic flex items-center text-sm text-muted-foreground mb-3">
                    <span
                      style={
                        {
                          "--vt-name": getPostAuthorTransitionName(blog.name),
                        } as React.CSSProperties
                      }
                    >
                      {blog.author}
                    </span>
                    <span className="mx-2">•</span>
                    <time
                      dateTime={blog.date}
                      style={
                        {
                          "--vt-name": getPostDateTransitionName(blog.name),
                        } as React.CSSProperties
                      }
                    >
                      {blog.date}
                    </time>
                  </address>

                  <p className="text-muted-foreground mb-3">{blog.excerpt}</p>

                  <ViewTransitionLink
                    href={`/${blog.name}`}
                    className="inline-block text-foreground hover:underline whitespace-nowrap font-medium"
                    aria-label={`Read more about ${blog.title}`}
                  >
                    Read More →
                  </ViewTransitionLink>
                </div>

                {blog.image && (
                  <ViewTransitionLink
                    href={`/${blog.name}`}
                    className="shrink-0 self-center"
                  >
                    <BlogPostImage
                      lightImage={blog.image}
                      darkImage={blog.imageDark}
                      alt={blog.title}
                      className="w-24 sm:w-32 md:w-40"
                      transitionName={getPostImageTransitionName(blog.name)}
                      priority={false}
                      sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 160px"
                    />
                  </ViewTransitionLink>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs py-1 rounded text-foreground"
                    style={
                      {
                        "--vt-name": getPostTagTransitionName(blog.name, tag),
                      } as React.CSSProperties
                    }
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      <Footer />
    </div>
  );
}
