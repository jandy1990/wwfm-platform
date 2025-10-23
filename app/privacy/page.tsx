export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Privacy Policy
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              What Worked For Me ("WWFM", "we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform to discover and share real-world solutions to life challenges.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Account Information
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Email address (required for account creation and verification)</li>
              <li>Account creation date</li>
              <li>Email verification status</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Contribution Data
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Solutions you share (product/service names, effectiveness ratings)</li>
              <li>Goal associations for your contributions</li>
              <li>Optional details (dosage, frequency, side effects, etc.)</li>
              <li>Timestamps of contributions</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Usage Information
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Pages you view and goals you explore</li>
              <li>Search queries</li>
              <li>Time spent on platform</li>
              <li>Device type and browser information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Aggregation:</strong> Individual contributions are combined into aggregate statistics displayed publicly (e.g., "4.5 stars from 127 users")</li>
              <li><strong>Personalization:</strong> Track your contributions and provide retrospective check-ins</li>
              <li><strong>Platform Improvement:</strong> Analyze usage patterns to enhance user experience</li>
              <li><strong>Communication:</strong> Send account-related emails and optional platform updates</li>
              <li><strong>Security:</strong> Detect and prevent fraud, abuse, or security issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              4. Data Privacy Principles
            </h2>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-blue-800 rounded-lg p-6 mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                Your Individual Data Remains Private
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                <li>Your specific ratings and contributions are NOT publicly visible</li>
                <li>Only aggregated statistics (averages, counts) are shown to other users</li>
                <li>We never share individual user data with third parties</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              5. Data Sharing and Third Parties
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We use the following trusted service providers:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Supabase:</strong> Database and authentication services (data stored securely with encryption)</li>
              <li><strong>Vercel:</strong> Platform hosting and delivery</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              We do NOT sell your personal information to third parties. Ever.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              6. Your Rights and Choices
            </h2>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update inaccurate information in your account</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Export:</strong> Download your contribution history</li>
              <li><strong>Opt-out:</strong> Unsubscribe from non-essential emails</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              To exercise these rights, contact us at privacy@whatworkedforme.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              7. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Encryption in transit (HTTPS) and at rest</li>
              <li>Row-level security policies in our database</li>
              <li>Regular security audits and updates</li>
              <li>Email verification for account creation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              WWFM is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe a child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              9. Changes to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update this Privacy Policy periodically. We will notify users of material changes via email or platform notification. Continued use after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For privacy-related questions or concerns:
            </p>
            <ul className="list-none text-gray-700 dark:text-gray-300 space-y-2">
              <li>📧 Email: privacy@whatworkedforme.com</li>
              <li>📝 Submit feedback through the platform</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
