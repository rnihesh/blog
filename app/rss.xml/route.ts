import { getAllPosts } from "@/lib/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.niheshr.com";

function generateRssItem(post: {
  name: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body: string;
  tags: string[];
}): string {
  const postUrl = `${siteUrl}/${post.name}`;
  const pubDate = new Date(post.date).toUTCString();

  return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.body}]]></content:encoded>
      <pubDate>${pubDate}</pubDate>
      <author>contact@niheshr.com (${post.author})</author>
      ${post.tags.map((tag) => `<category>${tag}</category>`).join("\n      ")}
    </item>
  `.trim();
}

function generateRssFeed(): string {
  const posts = getAllPosts();
  const latestPostDate =
    posts.length > 0
      ? new Date(posts[0].date).toUTCString()
      : new Date().toUTCString();

  const rssItems = posts.map((post) => generateRssItem(post)).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Nihesh's Blog</title>
    <link>${siteUrl}</link>
    <description>Technical blog about web development, WebRTC, system administration, and more</description>
    <language>en-us</language>
    <lastBuildDate>${latestPostDate}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`.trim();
}

export async function GET() {
  const feed = generateRssFeed();

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
