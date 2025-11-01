// Cache for 1 day - legal content changes very rarely
export const revalidate = 86400

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Medical Disclaimer
        </h1>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-4">
              ⚠️ Critical Information - Please Read Carefully
            </h2>
            <p className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3">
              WWFM Shares People's Experiences. This is NOT Medical Advice. Always Consult Healthcare Professionals.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              The information provided on What Worked For Me is based solely on user experiences and should never replace professional medical advice, diagnosis, or treatment.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              1. Not Medical Advice
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              WWFM is a platform for sharing personal experiences, NOT a medical resource:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Content reflects individual user experiences only</li>
              <li>We do not provide medical advice, diagnoses, or treatment recommendations</li>
              <li>Platform content is not created or reviewed by medical professionals</li>
              <li>Effectiveness ratings are based on subjective user reports, not clinical trials</li>
              <li>Solutions that worked for others may not work for you - or may even be harmful</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              2. Always Consult Healthcare Professionals
            </h2>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-blue-800 rounded-lg p-6 mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">
                Before making ANY health-related decisions based on WWFM content:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Consult with your doctor, physician, or qualified healthcare provider</li>
                <li>Discuss your specific medical condition, history, and circumstances</li>
                <li>Never disregard professional medical advice based on something you read on WWFM</li>
                <li>Never delay seeking medical advice because of WWFM content</li>
                <li>Always read medication labels and follow healthcare provider instructions</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              3. Individual Results Vary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              What works for one person may not work for another due to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Different medical conditions and diagnoses</li>
              <li>Unique genetic factors and biochemistry</li>
              <li>Varying lifestyle factors and environments</li>
              <li>Different medication interactions and contraindications</li>
              <li>Placebo effects and subjective perception</li>
              <li>Timing, dosage, and usage differences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              4. No Guarantees or Warranties
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              WWFM makes no guarantees about:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>The accuracy, completeness, or reliability of user contributions</li>
              <li>The safety or effectiveness of any solution mentioned</li>
              <li>The suitability of solutions for your specific situation</li>
              <li>Outcomes from trying solutions found on the platform</li>
              <li>The qualifications or expertise of contributing users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              5. Medication and Supplement Warnings
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-6 mb-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">
                Special caution for medications, supplements, and natural remedies:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Always consult a healthcare provider before starting any medication or supplement</li>
                <li>Be aware of potential drug interactions with your current medications</li>
                <li>"Natural" does not mean "safe" - natural products can have serious side effects</li>
                <li>Dosages mentioned are personal experiences, not medical recommendations</li>
                <li>Never adjust prescribed medications without consulting your doctor</li>
                <li>Report adverse reactions to your healthcare provider and regulatory authorities</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              6. Mental Health Disclaimer
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              For mental health-related content:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>If you're experiencing a mental health crisis, contact emergency services immediately</li>
              <li>Seek professional help from licensed therapists, counselors, or psychiatrists</li>
              <li>User experiences do not replace professional mental health treatment</li>
              <li>Some shared solutions may be inappropriate or harmful for certain conditions</li>
            </ul>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mt-4">
              <p className="text-gray-700 dark:text-gray-300 font-medium">
                🆘 Crisis Resources:
              </p>
              <ul className="list-none text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                <li>• 988 Suicide & Crisis Lifeline: Call or text 988</li>
                <li>• Crisis Text Line: Text HOME to 741741</li>
                <li>• Emergency: Call 911</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By using WWFM, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>You use the platform and any information at your own risk</li>
              <li>WWFM is not liable for any health outcomes, adverse effects, or injuries resulting from using platform content</li>
              <li>WWFM is not responsible for the accuracy of user-contributed information</li>
              <li>You are solely responsible for your health decisions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              8. Platform Purpose
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              WWFM exists to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Share real-world experiences in a transparent, community-driven way</li>
              <li>Help people discover potential solutions to explore with their healthcare providers</li>
              <li>Provide aggregate effectiveness data based on user reports</li>
              <li>Create a supportive space for sharing what has worked in personal journeys</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Use WWFM as a starting point for conversations with your healthcare team, not as medical guidance.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              9. Reporting Concerns
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              If you encounter content that you believe:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Contains medical misinformation</li>
              <li>Could be dangerous or harmful</li>
              <li>Violates platform guidelines</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              Please report it immediately through our feedback system or email: safety@whatworkedforme.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              10. Your Responsibility
            </h2>
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-3">
                By using WWFM, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
                <li>Take full responsibility for your health decisions</li>
                <li>Consult qualified healthcare professionals before trying any solution</li>
                <li>Not rely on WWFM content as medical advice</li>
                <li>Use the platform as an informational resource only</li>
                <li>Understand and accept the risks of trying unverified solutions</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
