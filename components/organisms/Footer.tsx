import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 dark:bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Product */}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/browse"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Browse Goals
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/contribute"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Share Your Solution
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Medical Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  Send Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-bold tracking-tight text-white uppercase mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="inline-block py-2 text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a
                  href="https://twitter.com/wwfm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors inline-flex items-center gap-1"
                >
                  Twitter
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/wwfm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gray-300 hover:text-purple-400 transition-colors inline-flex items-center gap-1"
                >
                  GitHub
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Logo & Copyright */}
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center group">
                <span className="text-lg font-black tracking-tight text-white flex items-start">
                  WWFM<span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 ml-0.5 mt-1"></span>
                </span>
              </Link>
              <span className="text-sm text-gray-400">
                © {currentYear} What Worked For Me. All rights reserved.
              </span>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center md:text-right max-w-md">
              WWFM Shares People's Experiences. This is not Medical Advice. Always Consult Healthcare Professionals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
