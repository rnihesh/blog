import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import { HomeClient } from "@/components/home-client";

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
      <Suspense>
        <HomeClient blogs={blogs} />
      </Suspense>
    </>
  );
}
