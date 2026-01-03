import Link from 'next/link'
import blogs from '../blogs.json'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">My Blog</h1>
          <p className="text-xl text-gray-600">Welcome to my collection of thoughts and tutorials</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {blogs.map((blog) => (
            <Link
              key={blog.unique_name}
              href={`/${blog.unique_name}`}
              className="block bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {blog.title}
                </h2>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>{blog.author}</span>
                  <span className="mx-2">•</span>
                  <span>{blog.date}</span>
                </div>
                <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-blue-600 px-6 py-3 text-white font-medium">
                Read More →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
