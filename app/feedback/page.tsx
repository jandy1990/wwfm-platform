export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Send Feedback
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Your feedback helps us build a better platform. We read every submission and prioritize based on community needs.
          </p>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="feedback-type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Feedback Type
                </label>
                <select
                  id="feedback-type"
                  name="type"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select type...</option>
                  <option value="feature">💡 Feature Request</option>
                  <option value="bug">🐛 Bug Report</option>
                  <option value="improvement">✨ Improvement Suggestion</option>
                  <option value="ui">🎨 UI/UX Feedback</option>
                  <option value="content">📝 Content Suggestion</option>
                  <option value="other">💬 General Feedback</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="feedback-title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="feedback-title"
                  name="title"
                  placeholder="Brief summary of your feedback..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="feedback-details"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Details
                </label>
                <textarea
                  id="feedback-details"
                  name="details"
                  rows={6}
                  placeholder="Please provide as much detail as possible..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  For bugs: Include steps to reproduce, browser/device info, and what you expected to happen.
                </p>
              </div>

              <div>
                <label
                  htmlFor="feedback-email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="feedback-email"
                  name="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Provide your email if you'd like us to follow up with you.
                </p>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg
                         transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
