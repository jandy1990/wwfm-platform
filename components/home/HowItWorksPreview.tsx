import Link from 'next/link'

export default function HowItWorksPreview() {
  return (
    <section className="bg-gray-900 dark:bg-black py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Heading - Bigger and bolder */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-6">😰</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Want to reduce anxiety?
          </h2>
          <p className="text-xl text-gray-300">
            Here's what actually worked:
          </p>
        </div>

        {/* Solution Cards - Larger and bolder */}
        <div className="space-y-4 max-w-2xl mx-auto mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-purple-400 dark:border-purple-600 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Running (30 min/day)</span>
              <span className="text-yellow-500 font-bold text-2xl">★ 4.6</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              847 people tried this
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Therapy (CBT)</span>
              <span className="text-yellow-500 font-bold text-2xl">★ 4.5</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              1,203 people tried this
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-gray-300 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Headspace App</span>
              <span className="text-yellow-500 font-bold text-2xl">★ 4.2</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              692 people tried this
            </div>
          </div>
        </div>

        {/* Footer with stats + CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">
            + 50 more solutions ranked by effectiveness
          </p>
          <Link
            href="/how-it-works"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 font-semibold text-lg transition-colors"
          >
            See how it works →
          </Link>
        </div>
      </div>
    </section>
  )
}
