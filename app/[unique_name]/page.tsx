import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import blogs from '../../blogs.json'

interface BlogPageProps {
  params: Promise<{
    unique_name: string
  }>
}

export async function generateStaticParams() {
  return blogs.map((blog) => ({
    unique_name: blog.unique_name,
  }))
}

export async function generateMetadata({ params }: BlogPageProps) {
  const resolvedParams = await params
  const blog = blogs.find((b) => b.unique_name === resolvedParams.unique_name)
  
  if (!blog) {
    return {
      title: 'Blog Not Found',
    }
  }

  return {
    title: blog.title,
    description: blog.excerpt,
  }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const resolvedParams = await params
  const blog = blogs.find((b) => b.unique_name === resolvedParams.unique_name)

  if (!blog) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 font-medium"
          >
            ← Back to all posts
          </Link>

          <article className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {blog.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <span className="font-medium">{blog.author}</span>
                <span className="mx-2">•</span>
                <span>{blog.date}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <div className="markdown-content prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre({ node, children, ...props }: any) {
                    return <pre {...props}>{children}</pre>
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
                    )
                  },
                }}
              >
                {blog.body}
              </ReactMarkdown>
            </div>
          </article>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
