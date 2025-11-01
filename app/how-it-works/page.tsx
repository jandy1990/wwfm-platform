import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-6">
            Sick of guessing?
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300">
            WWFM shows you what actually worked.
          </p>
        </div>

        {/* Example - Anxiety Goal with Solutions */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-12">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">😰</div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
              "I want to reduce my anxiety"
            </div>
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900 dark:text-gray-100">Running (30 min/day)</span>
                <span className="text-yellow-500 font-bold">★ 4.6</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                847 people tried this
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900 dark:text-gray-100">Therapy (CBT)</span>
                <span className="text-yellow-500 font-bold">★ 4.5</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                1,203 people tried this
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900 dark:text-gray-100">Headspace App</span>
                <span className="text-yellow-500 font-bold">★ 4.2</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                692 people tried this
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-6 text-sm">
            + 50 more solutions ranked by effectiveness
          </p>
        </div>

        {/* AI/Community Data Explanation */}
        <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
            You'll see two types of data:
          </h3>

          <div className="space-y-6 max-w-xl mx-auto">
            {/* Example card with AI badge */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border-2 border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Magnesium Supplements</span>
                <span className="text-yellow-500 font-bold">★ 4.3</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs rounded-md font-semibold">
                  🤖 AI-Generated
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Based on training data
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-center text-3xl text-gray-400">↓</div>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              After 10 people rate it...
            </div>

            {/* Example card with Community badge */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border-2 border-green-300 dark:border-green-700">
              <div className="flex justify-between items-start mb-3">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Magnesium Supplements</span>
                <span className="text-yellow-500 font-bold">★ 4.7</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs rounded-md font-semibold">
                  ✓ Community Verified
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  24 real people
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-12">
          <span className="text-lg">🔒</span>
          <span>Your rating is private. We only show totals.</span>
        </div>

        {/* Simple steps */}
        <div className="text-center mb-12">
          <p className="text-xl text-gray-700 dark:text-gray-300">
            Pick your goal → See what works → Try it
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/browse"
            className="inline-block px-10 py-4 bg-purple-600 text-white rounded-lg font-bold text-lg
                     hover:bg-purple-700 transition-colors shadow-lg"
          >
            Browse Goals
          </Link>
        </div>
      </div>
    </div>
  )
}
