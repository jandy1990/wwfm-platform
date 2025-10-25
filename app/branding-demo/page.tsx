import Link from 'next/link';

export default function BrandingDemo() {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black tracking-tight text-white mb-4">
            WWFM Globe Concept Exploration
          </h1>
          <p className="text-lg text-gray-300">
            Replacing TM with a dot/globe that represents worldwide community knowledge
          </p>
        </div>

        {/* Concept Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

          {/* Option 1: Simple Purple Dot */}
          <div className="bg-white rounded-lg p-8 border-2 border-gray-300">
            <div className="text-center mb-6">
              <div className="text-6xl font-black tracking-tight text-gray-900 mb-2">
                WWFM<span className="text-purple-600">●</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-4">Option 1: Simple Purple Dot</p>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <p>✓ Clean and minimal</p>
              <p>✓ Perfect scaling</p>
              <p>✓ Matches Graya aesthetic</p>
              <p>✓ Easy to implement</p>
            </div>
          </div>

          {/* Option 2: Gradient Globe */}
          <div className="bg-white rounded-lg p-8 border-2 border-gray-300">
            <div className="text-center mb-6">
              <div className="text-6xl font-black tracking-tight text-gray-900 mb-2 flex items-start justify-center">
                <span>WWFM</span>
                <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 via-purple-600 to-purple-800 ml-1"></span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-4">Option 2: Gradient Globe</p>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <p>✓ Subtle depth/sphere hint</p>
              <p>✓ More sophisticated</p>
              <p>✓ Still minimal</p>
              <p>⚠ Gradient may be too subtle</p>
            </div>
          </div>

          {/* Option 3: Ringed Dot (Orbit) */}
          <div className="bg-white rounded-lg p-8 border-2 border-gray-300">
            <div className="text-center mb-6">
              <div className="text-6xl font-black tracking-tight text-gray-900 mb-2">
                WWFM<span className="text-purple-600">⦿</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-4">Option 3: Ringed Dot (Orbit)</p>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <p>✓ Suggests planet/orbit</p>
              <p>✓ Unique character</p>
              <p>✓ Textual (good for accessibility)</p>
              <p>⚠ Font-dependent rendering</p>
            </div>
          </div>

          {/* Option 4: Hollow Circle */}
          <div className="bg-white rounded-lg p-8 border-2 border-gray-300">
            <div className="text-center mb-6">
              <div className="text-6xl font-black tracking-tight text-gray-900 mb-2">
                WWFM<span className="text-purple-600">○</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-4">Option 4: Hollow Circle</p>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <p>✓ Lighter weight</p>
              <p>✓ Globe outline feeling</p>
              <p>✓ Minimal and clean</p>
              <p>⚠ May be too light</p>
            </div>
          </div>

          {/* Option 5: CSS Globe (Blue/Green hint) */}
          <div className="bg-white rounded-lg p-8 border-2 border-gray-300">
            <div className="text-center mb-6">
              <div className="text-6xl font-black tracking-tight text-gray-900 mb-2 flex items-start justify-center">
                <span>WWFM</span>
                <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 via-green-500 to-blue-600 ml-1"></span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-4">Option 5: Earth Colors (Blue/Green)</p>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <p>✓ Literally Earth-like</p>
              <p>✓ Obvious globe reference</p>
              <p>⚠ Breaks purple brand consistency</p>
              <p>⚠ Too literal?</p>
            </div>
          </div>

          {/* Option 6: Animated Pulse Dot */}
          <div className="bg-white rounded-lg p-8 border-2 border-gray-300">
            <div className="text-center mb-6">
              <div className="text-6xl font-black tracking-tight text-gray-900 mb-2 flex items-start justify-center">
                <span>WWFM</span>
                <span className="relative inline-block ml-1">
                  <span className="absolute inset-0 w-3 h-3 rounded-full bg-purple-600 animate-ping opacity-75"></span>
                  <span className="relative inline-block w-3 h-3 rounded-full bg-purple-600"></span>
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-600 mt-4">Option 6: Animated Pulse (Hover State)</p>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <p>✓ Suggests global activity</p>
              <p>✓ Eye-catching</p>
              <p>✓ "Knowledge flowing worldwide"</p>
              <p>⚠ Animation may be distracting</p>
            </div>
          </div>

        </div>

        {/* Dark Mode Preview */}
        <div className="bg-gray-950 rounded-lg p-12 border-2 border-gray-700 mb-16">
          <h2 className="text-3xl font-black tracking-tight text-white mb-8 text-center">
            Dark Mode Context
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-black tracking-tight text-white mb-4">
                WWFM<span className="text-purple-400">●</span>
              </div>
              <p className="text-sm text-gray-400">Simple Dot (Dark)</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black tracking-tight text-white mb-4 flex items-start justify-center">
                <span>WWFM</span>
                <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-purple-300 via-purple-500 to-purple-700 ml-1"></span>
              </div>
              <p className="text-sm text-gray-400">Gradient (Dark)</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black tracking-tight text-white mb-4">
                WWFM<span className="text-purple-400">⦿</span>
              </div>
              <p className="text-sm text-gray-400">Ringed (Dark)</p>
            </div>
          </div>
        </div>

        {/* Size Variations */}
        <div className="bg-white rounded-lg p-12 border-2 border-gray-300 mb-16">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 mb-8 text-center">
            Scale Test: Simple Purple Dot
          </h2>
          <div className="space-y-8">
            <div className="text-center">
              <div className="text-8xl font-black tracking-tight text-gray-900">
                WWFM<span className="text-purple-600">●</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Hero Size (8xl)</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black tracking-tight text-gray-900">
                WWFM<span className="text-purple-600">●</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Header Size (5xl)</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black tracking-tight text-gray-900">
                WWFM<span className="text-purple-600">●</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Navigation Size (2xl)</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-black tracking-tight text-gray-900">
                WWFM<span className="text-purple-600">●</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Footer Size (lg)</p>
            </div>
          </div>
        </div>

        {/* Context Mockups */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black tracking-tight text-white mb-8 text-center">
            In Context: Navigation Bar
          </h2>

          {/* Light Nav */}
          <div className="bg-white border-b-2 border-gray-300 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-2xl font-black tracking-tight text-gray-900">
                WWFM<span className="text-purple-600">●</span>
              </div>
              <div className="flex gap-6 text-sm font-semibold text-gray-600">
                <a href="#" className="hover:text-purple-600">Browse</a>
                <a href="#" className="hover:text-purple-600">Search</a>
                <a href="#" className="hover:text-purple-600">Contribute</a>
              </div>
            </div>
          </div>

          {/* Dark Nav */}
          <div className="bg-gray-900 border-b-2 border-gray-700 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="text-2xl font-black tracking-tight text-white">
                WWFM<span className="text-purple-400">●</span>
              </div>
              <div className="flex gap-6 text-sm font-semibold text-gray-300">
                <a href="#" className="hover:text-purple-400">Browse</a>
                <a href="#" className="hover:text-purple-400">Search</a>
                <a href="#" className="hover:text-purple-400">Contribute</a>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="mt-16 bg-purple-50 border-2 border-purple-400 rounded-lg p-8">
          <h2 className="text-2xl font-black tracking-tight text-purple-900 mb-4">
            Recommendation: Simple Purple Dot (●)
          </h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>Why it works:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Perfect alignment with Graya's bold, minimal aesthetic</li>
              <li>Scales flawlessly at all sizes</li>
              <li>Maintains purple brand consistency</li>
              <li>Subtle enough to not compete with content</li>
              <li>The "dot as world" metaphor works without being literal</li>
              <li>Easy to implement and maintain</li>
            </ul>
            <p className="mt-4"><strong>The meaning:</strong> The dot represents the collective knowledge of people worldwide - a simple, bold statement that WWFM is global community wisdom, not a corporate trademark.</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
