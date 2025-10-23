export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Help Center
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Find answers to common questions and learn how to make the most of WWFM.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Getting Started
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  What is WWFM?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  WWFM (What Worked For Me) is a platform where people share real solutions to life challenges. Unlike traditional review sites, we organize by problems (goals) not products, so you can discover what actually helped people achieve outcomes like "reduce anxiety" or "sleep better."
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  How do I find solutions?
                </h3>
                <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Browse by life area (Health, Career, Relationships, etc.)</li>
                  <li>Select a specific goal you're working toward</li>
                  <li>View solutions ranked by community effectiveness</li>
                  <li>Filter by your preferences (cost, time commitment, etc.)</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  How do I contribute?
                </h3>
                <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Create a free account and verify your email</li>
                  <li>Click "Share What Worked" in the navigation</li>
                  <li>Tell us what solution you tried and for which goal</li>
                  <li>Rate its effectiveness and share relevant details</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Understanding the Platform
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  What are effectiveness ratings?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Effectiveness ratings (1-5 stars) reflect how well a solution worked for users trying to achieve a specific goal. Ratings are averaged across all contributors and displayed as aggregate statistics.
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>⭐ 1 star: Didn't help at all</li>
                  <li>⭐⭐ 2 stars: Helped a little</li>
                  <li>⭐⭐⭐ 3 stars: Moderately helpful</li>
                  <li>⭐⭐⭐⭐ 4 stars: Very helpful</li>
                  <li>⭐⭐⭐⭐⭐ 5 stars: Extremely helpful</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Is my data private?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes! Your individual contributions are private. We only display aggregated statistics (averages, counts) publicly. Other users cannot see your specific ratings or personal details. See our <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</a> for details.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  How do you ensure quality?
                </h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Email verification required for contributions</li>
                  <li>Solutions must be specific (not generic categories)</li>
                  <li>Community reporting system for problematic content</li>
                  <li>Moderation team reviews flagged content</li>
                  <li>Anti-spam filters and fraud detection</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account & Settings
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  How do I reset my password?
                </h3>
                <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Go to the Sign In page</li>
                  <li>Click "Forgot Password"</li>
                  <li>Enter your email address</li>
                  <li>Check your email for reset instructions</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Can I delete my account?
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Yes. Go to Settings → Account → Delete Account. Note that this action is permanent and will remove all your contributions. Aggregated statistics will be recalculated without your data.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Safety & Guidelines
            </h2>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-medium text-red-900 dark:text-red-200 mb-3">
                ⚠️ Remember: This is NOT Medical Advice
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                WWFM shares people's experiences. Always consult healthcare professionals before making health decisions. See our <a href="/disclaimer" className="text-purple-600 dark:text-purple-400 hover:underline">Medical Disclaimer</a>.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                Community Guidelines
              </h3>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Share genuine personal experiences only</li>
                <li>Be honest and accurate in your contributions</li>
                <li>Don't promote products you're affiliated with</li>
                <li>Respect others' experiences and perspectives</li>
                <li>Report content that violates guidelines</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Still Need Help?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Can't find what you're looking for? We're here to help!
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-blue-800 rounded-lg p-6">
              <ul className="list-none text-gray-700 dark:text-gray-300 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-xl">📧</span>
                  <div>
                    <strong>Email Support:</strong><br />
                    support@whatworkedforme.com
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <strong>Send Feedback:</strong><br />
                    Use the feedback widget on any page
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <strong>Contact Form:</strong><br />
                    <a href="/contact" className="text-purple-600 dark:text-purple-400 hover:underline">Submit a detailed inquiry</a>
                  </div>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
