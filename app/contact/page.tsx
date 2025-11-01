// Cache for 1 hour - contact info changes rarely
export const revalidate = 3600

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Contact Us
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            We'd love to hear from you. Choose the best way to reach us based on your needs.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Support */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                General Support
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Questions about using the platform, account issues, or general inquiries
              </p>
              <a
                href="mailto:support@whatworkedforme.com"
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                support@whatworkedforme.com
              </a>
            </div>

            {/* Privacy */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Privacy Concerns
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Data requests, privacy questions, or account deletion
              </p>
              <a
                href="mailto:privacy@whatworkedforme.com"
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                privacy@whatworkedforme.com
              </a>
            </div>

            {/* Content Issues */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-3xl mb-4">🚨</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Report Content
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Report harmful content, misinformation, or guideline violations
              </p>
              <a
                href="mailto:safety@whatworkedforme.com"
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                safety@whatworkedforme.com
              </a>
            </div>

            {/* Business */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Business Inquiries
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Partnerships, press, or legal matters
              </p>
              <a
                href="mailto:business@whatworkedforme.com"
                className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
              >
                business@whatworkedforme.com
              </a>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Send Us a Message
            </h2>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <form className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a topic...</option>
                    <option value="support">General Support</option>
                    <option value="privacy">Privacy Concern</option>
                    <option value="content">Report Content</option>
                    <option value="business">Business Inquiry</option>
                    <option value="feedback">Feedback/Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                             focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg
                           transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Send Message
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                We typically respond within 24-48 hours. For urgent safety concerns, please email safety@whatworkedforme.com directly.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Other Ways to Connect
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Feedback Widget</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Use the feedback button on any page for quick suggestions or bug reports
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Feature Requests</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Have an idea to improve WWFM? We'd love to hear it at feedback@whatworkedforme.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="text-2xl">🐛</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Bug Reports</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Found a technical issue? Email bugs@whatworkedforme.com with details
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              FAQ & Resources
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Before reaching out, you might find your answer in these resources:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>
                <a href="/help" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Help Center
                </a>{' '}
                - Common questions and how-to guides
              </li>
              <li>
                <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Privacy Policy
                </a>{' '}
                - How we handle your data
              </li>
              <li>
                <a href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Terms of Service
                </a>{' '}
                - Platform rules and guidelines
              </li>
              <li>
                <a href="/disclaimer" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Medical Disclaimer
                </a>{' '}
                - Important health information
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
