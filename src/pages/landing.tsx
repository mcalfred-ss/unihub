import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pastel-blue via-pastel-green to-pastel-pink">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-primary-600 mb-6">
            Your University Resources Hub
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Notes, past questions, and study materials — shared by students.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg shadow-lg hover:shadow-xl"
          >
            Explore Resources
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-primary-600 mb-12">
            Why Choose UniHub?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Search</h3>
              <p className="text-gray-600">Quickly find the resources you need</p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Resources</h3>
              <p className="text-gray-600">Quality content from verified sources</p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community-Driven</h3>
              <p className="text-gray-600">Built by students, for students</p>
            </div>

            {/* Feature 4 */}
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Forever</h3>
              <p className="text-gray-600">No cost, no limits, no worries</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

