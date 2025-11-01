// Cache for 1 day - legal content changes very rarely
export const revalidate = 86400

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Terms of Service
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing or using What Worked For Me ("WWFM", "the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              2. Platform Purpose
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              WWFM is a crowdsourced platform where users share and discover real-world solutions to life challenges. The Platform:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Aggregates user experiences with various solutions (products, services, practices)</li>
              <li>Displays effectiveness ratings based on community contributions</li>
              <li>Organizes solutions by goals and life areas for easy discovery</li>
              <li>Provides a space for people to help each other through shared experiences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              3. User Accounts
            </h2>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Account Registration
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>You must provide a valid email address</li>
              <li>You must verify your email before contributing</li>
              <li>You are responsible for maintaining account security</li>
              <li>One account per person</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Account Termination
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We reserve the right to suspend or terminate accounts that violate these terms, including accounts used for spam, fraud, or harmful content.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              4. User Contributions
            </h2>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              When You Contribute, You Agree To:
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Share only your genuine personal experiences</li>
              <li>Provide accurate information to the best of your knowledge</li>
              <li>Specify actual solutions (not generic categories)</li>
              <li>Rate effectiveness honestly based on your results</li>
              <li>Not promote products/services you have a financial interest in</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Prohibited Content:
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Spam, advertising, or promotional content</li>
              <li>False, misleading, or fraudulent information</li>
              <li>Harmful, offensive, or discriminatory content</li>
              <li>Medical advice or diagnoses</li>
              <li>Personally identifiable information about others</li>
              <li>Content that infringes intellectual property rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              5. Content Ownership and License
            </h2>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Your Content
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              You retain ownership of your contributions. However, by sharing content on WWFM, you grant us a worldwide, non-exclusive, royalty-free license to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Display your contributions in aggregated form</li>
              <li>Use your data to calculate and display effectiveness statistics</li>
              <li>Improve platform features and recommendations</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
              Platform Content
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              All platform features, design, text, graphics, and organization are owned by WWFM and protected by copyright and intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              6. Medical Disclaimer
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-3">
                IMPORTANT: WWFM Shares People's Experiences. This is NOT Medical Advice.
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Content on WWFM reflects personal experiences only</li>
                <li>Always consult qualified healthcare professionals before making health decisions</li>
                <li>Do not delay or disregard medical advice based on platform content</li>
                <li>Individual results vary - what worked for others may not work for you</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>WWFM is provided "AS IS" without warranties of any kind</li>
              <li>We do not guarantee the accuracy, completeness, or effectiveness of user contributions</li>
              <li>We are not liable for decisions made based on platform content</li>
              <li>We are not responsible for outcomes from trying solutions found on WWFM</li>
              <li>Our total liability shall not exceed the amount you paid us (if any) in the past 12 months</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              8. Indemnification
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify and hold WWFM harmless from any claims, damages, or expenses arising from your use of the Platform, your contributions, or your violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              9. Platform Availability
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We strive for reliable service but do not guarantee uninterrupted access. We may modify, suspend, or discontinue features at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              10. Dispute Resolution
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Any disputes shall be resolved through:
            </p>
            <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Good faith negotiation between parties</li>
              <li>Binding arbitration if negotiation fails</li>
              <li>Arbitration conducted in English</li>
            </ol>
            <p className="text-gray-700 dark:text-gray-300">
              You waive the right to participate in class action lawsuits against WWFM.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              We may update these Terms at any time. Material changes will be communicated via email or platform notice. Continued use after changes constitutes acceptance of updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              12. Contact Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Questions about these Terms?
            </p>
            <ul className="list-none text-gray-700 dark:text-gray-300 space-y-2">
              <li>📧 Email: legal@whatworkedforme.com</li>
              <li>📝 Submit feedback through the platform</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
