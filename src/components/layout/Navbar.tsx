import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              {process.env.NEXT_PUBLIC_APP_NAME || 'UniHub'}
            </span>
          </Link>

          {/* Upload Button */}
          <Link
            href="/upload"
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Upload
          </Link>
        </div>
      </div>
    </nav>
  )
}

