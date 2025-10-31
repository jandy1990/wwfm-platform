import Link from 'next/link'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 py-12">
      <div className="max-w-6xl mx-auto px-4 space-y-12">

        {/* Concept Navigation */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4">
          <p className="text-center font-bold text-yellow-900 dark:text-yellow-200">
            🎨 AI EXPLANATION MOCKUPS - Based on Concept B - Scroll to compare 4 options
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OPTION 1: Two-Panel Visual (Before/After) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-4 border-blue-500 rounded-2xl p-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <div className="bg-blue-500 text-white px-6 py-3 font-black text-lg">
              OPTION 1: Two-Panel Visual (Before/After)
            </div>

            <div className="py-20 px-4">
              <div className="max-w-3xl mx-auto">
                {/* Problem statement */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-6">
                    Sick of guessing?
                  </h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300">
                    WWFM shows you what actually worked.
                  </p>
                </div>

                {/* Example with real solution cards */}
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

                {/* AI EXPLANATION - OPTION 1: Two panels */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-8 mb-12">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                    Where does this data come from?
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: AI Badge */}
                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border-2 border-orange-300 dark:border-orange-700">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">🤖</span>
                        <span className="font-bold text-orange-900 dark:text-orange-200">AI-Generated</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        We start with research-backed data from medical studies and clinical trials.
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        0 ratings yet
                      </div>
                    </div>

                    {/* Right: Community Badge */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border-2 border-green-300 dark:border-green-700">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">✓</span>
                        <span className="font-bold text-green-900 dark:text-green-200">Community Verified</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        After 10 people rate a solution, we switch to real user data.
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        10+ ratings from real people
                      </div>
                    </div>
                  </div>
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
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OPTION 2: Progress Bar Story */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-4 border-green-500 rounded-2xl p-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <div className="bg-green-500 text-white px-6 py-3 font-black text-lg">
              OPTION 2: Progress Bar Story
            </div>

            <div className="py-20 px-4">
              <div className="max-w-3xl mx-auto">
                {/* Problem statement */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-6">
                    Sick of guessing?
                  </h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300">
                    WWFM shows you what actually worked.
                  </p>
                </div>

                {/* Example with real solution cards */}
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

                {/* AI EXPLANATION - OPTION 2: Progress bar */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-8 mb-12">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
                    Where does this data come from?
                  </h3>

                  <div className="space-y-6 max-w-xl mx-auto">
                    {/* Step 1 */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🤖</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">We start with research</span>
                      </div>
                      <div className="flex gap-1 ml-11">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-8 h-8 bg-orange-400 rounded-md flex items-center justify-center text-xs">
                            🤖
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-11 mt-2">
                        100% AI-generated from medical studies
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">👥</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">People add real experiences</span>
                      </div>
                      <div className="flex gap-1 ml-11">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className={`w-8 h-8 ${i < 7 ? 'bg-orange-400' : 'bg-green-400'} rounded-md flex items-center justify-center text-xs`}>
                            {i < 7 ? '🤖' : '👤'}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-11 mt-2">
                        7 people have rated this
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">✓</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">Community takes over (10+ ratings)</span>
                      </div>
                      <div className="flex gap-1 ml-11">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="w-8 h-8 bg-green-400 rounded-md flex items-center justify-center text-xs">
                            👤
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-11 mt-2">
                        100% Real user data
                      </p>
                    </div>
                  </div>
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
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OPTION 3: Simple Statement + Icon */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-4 border-purple-500 rounded-2xl p-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <div className="bg-purple-500 text-white px-6 py-3 font-black text-lg">
              OPTION 3: Simple Statement + Icon
            </div>

            <div className="py-20 px-4">
              <div className="max-w-3xl mx-auto">
                {/* Problem statement */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-6">
                    Sick of guessing?
                  </h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300">
                    WWFM shows you what actually worked.
                  </p>
                </div>

                {/* Example with real solution cards */}
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

                {/* AI EXPLANATION - OPTION 3: Simple statement */}
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-8 mb-12">
                  <div className="text-center">
                    <div className="text-6xl mb-6">🤖 → 👥</div>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      We start with research.
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Real people make it better.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      (10 ratings = community data)
                    </p>
                  </div>
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
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OPTION 4: Inline Within Solution Cards */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-4 border-orange-500 rounded-2xl p-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <div className="bg-orange-500 text-white px-6 py-3 font-black text-lg">
              OPTION 4: Inline (Under Solution Cards)
            </div>

            <div className="py-20 px-4">
              <div className="max-w-3xl mx-auto">
                {/* Problem statement */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-6">
                    Sick of guessing?
                  </h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300">
                    WWFM shows you what actually worked.
                  </p>
                </div>

                {/* Example with real solution cards */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-8">
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

                {/* AI EXPLANATION - OPTION 4: Inline callout */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg p-6 mb-12">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">💡</div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3">
                        Where does this data come from?
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p>
                          <span className="font-semibold">🤖 Research-backed starting point</span> - We seed solutions with data from medical studies
                        </p>
                        <p>
                          <span className="font-semibold">👥 Gets better as people contribute</span> - Real experiences replace AI data
                        </p>
                        <p>
                          <span className="font-semibold">✓ Switches to community data after 10 ratings</span> - You'll see who's verified
                        </p>
                      </div>
                    </div>
                  </div>
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
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OPTION 5: Badge Showcase (New) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="border-4 border-pink-500 rounded-2xl p-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <div className="bg-pink-500 text-white px-6 py-3 font-black text-lg">
              OPTION 5: Badge Showcase (New)
            </div>

            <div className="py-20 px-4">
              <div className="max-w-3xl mx-auto">
                {/* Problem statement */}
                <div className="text-center mb-12">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100 mb-6">
                    Sick of guessing?
                  </h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300">
                    WWFM shows you what actually worked.
                  </p>
                </div>

                {/* Example with real solution cards */}
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

                {/* AI EXPLANATION - OPTION 5: Show the actual badges */}
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
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-12"></div>
      </div>
    </div>
  )
}
