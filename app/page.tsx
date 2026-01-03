import Link from 'next/link'
import blogs from '../blogs.json'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <header className="mb-16">
          <h1 className="text-4xl font-bold mb-2">My Blog</h1>
          <p className="text-muted-foreground">Welcome to my collection of thoughts and tutorials</p>
        </header>

        <div className="space-y-8">
          {blogs.map((blog) => (
            <article
              key={blog.unique_name}
              className="border-b border-border pb-8 last:border-b-0"
            >
              <Link href={`/${blog.unique_name}`} className="group">
                <h2 className="text-2xl font-bold mb-2 group-hover:underline">
                  {blog.title}
                </h2>
              </Link>
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <span>{blog.author}</span>
                <span className="mx-2">•</span>
                <span>{blog.date}</span>
              </div>
              <p className="text-muted-foreground mb-4">{blog.excerpt}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded bg-muted text-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild size="lg">
                <Link href={`/${blog.unique_name}`}>
                  Read More
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
