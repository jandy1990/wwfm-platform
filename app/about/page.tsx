export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          About WWFM
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Our Mission
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              To help people discover solutions to life's challenges by crowdsourcing real experiences and organizing them by goals, not products.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              The Problem We're Solving
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              When you're trying to solve a problem - reduce anxiety, sleep better, advance your career - the internet is overwhelming:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mb-4">
              <li><strong>Product-focused reviews</strong> tell you about one solution at a time</li>
              <li><strong>Generic advice</strong> doesn't account for individual differences</li>
              <li><strong>Sponsored content</strong> prioritizes profit over effectiveness</li>
              <li><strong>Scattered information</strong> makes comparison difficult</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              People end up trying solutions randomly, wasting time and money on things that don't work for their specific goal.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              The WWFM Approach
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We flip the model: instead of organizing by products, we organize by goals. Here's how it works:
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">
                Traditional Approach
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                "Here's what Vitamin D does (improves mood, supports bones, boosts immunity...)"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                → Overwhelming, unclear if it will help YOUR specific goal
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-4">
                WWFM Approach
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                "Here's what worked for people trying to sleep better (Magnesium: 4.5⭐, Vitamin D: 3.2⭐, Melatonin: 4.1⭐...)"
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                → Clear comparison for YOUR specific goal
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              How We're Different
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🎯 Goal-Organized
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Browse by what you're trying to achieve, not by product categories
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  📊 Effectiveness First
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  See what actually worked for people with the same goal, ranked by effectiveness
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🔒 Privacy-First
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Your individual data stays private - only aggregated statistics are public
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🚫 No Ads or Sponsors
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Pure community contributions - no paid placements or affiliate links
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  ✅ Quality Filters
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Specific solutions only - no generic "therapy" or "meditation apps"
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  🔄 Retrospective Check-ins
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Track what worked long-term, not just initial impressions
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Platform Stats
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  228
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Life Goals
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  3,850+
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Solutions
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  4.15
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Avg Effectiveness
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Core Principles
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  1. User-Centric Design
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Every feature exists to help real people find real solutions. If it doesn't serve users, it doesn't belong on the platform.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  2. Privacy First
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Individual contributions are private. Only aggregated statistics are public. Your personal health journey is yours alone.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  3. Quality Over Quantity
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We enforce specificity. "Headspace" is a solution. "Meditation apps" is not. This ensures every entry adds real value.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  4. Transparency
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We show you exactly how many people contributed to each rating. We distinguish between AI-seeded data and user contributions. No hidden algorithms.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-red-900 dark:text-red-200 mb-4">
                Important Disclaimer
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                WWFM Shares People's Experiences. This is NOT Medical Advice. Always Consult Healthcare Professionals.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                We provide a platform for sharing experiences, not medical guidance. Individual results vary, and what worked for others may not work for you. Read our full{' '}
                <a href="/disclaimer" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Medical Disclaimer
                </a>
                .
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Join the Community
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              WWFM works because people like you share what worked for them. Every contribution helps someone discover a solution that could change their life.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                How You Can Help
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li><strong>Share what worked</strong> - Contribute your experiences to help others</li>
                <li><strong>Be specific</strong> - Name actual solutions, not categories</li>
                <li><strong>Be honest</strong> - Rate effectiveness accurately, even if it's low</li>
                <li><strong>Track what failed</strong> - Knowing what doesn't work is valuable too</li>
                <li><strong>Check in later</strong> - Update your ratings after more time has passed</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Contact & Connect
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We're always improving based on community feedback. Get in touch:
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">📧</span>
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">Email:</strong>{' '}
                  <a href="mailto:hello@whatworkedforme.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    hello@whatworkedforme.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl">🐦</span>
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">Twitter:</strong>{' '}
                  <a href="https://twitter.com/wwfm" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    @wwfm
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-2xl">💻</span>
                <div>
                  <strong className="text-gray-900 dark:text-gray-100">GitHub:</strong>{' '}
                  <a href="https://github.com/wwfm" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    github.com/wwfm
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
