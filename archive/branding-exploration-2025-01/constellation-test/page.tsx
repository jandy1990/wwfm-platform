'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Constellation Network SVG Component
function ConstellationLogo({ size = 'default' }: { size?: 'default' | 'large' | 'small' }) {
  const dimensions = {
    small: { text: 'text-xl', dotSize: 'w-3 h-3', spacing: 'gap-1' },
    default: { text: 'text-2xl sm:text-3xl', dotSize: 'w-4 h-4', spacing: 'gap-1.5' },
    large: { text: 'text-4xl', dotSize: 'w-6 h-6', spacing: 'gap-2' }
  };

  const { text, dotSize, spacing } = dimensions[size];

  return (
    <div className={`flex items-center ${spacing}`}>
      <span className={`${text} font-black tracking-tight text-gray-900 dark:text-gray-100`}>
        WWFM
      </span>
      <div className={`relative ${dotSize}`}>
        {/* Top dot */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-900 dark:bg-gray-100"></div>

        {/* Top right dot */}
        <div className="absolute top-1/4 right-0 w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>

        {/* Top left dot */}
        <div className="absolute top-1/4 left-0 w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>

        {/* Center dot (PURPLE - brand focus) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-600 shadow-lg shadow-purple-400/50"></div>

        {/* Bottom right dot */}
        <div className="absolute bottom-1/4 right-0 w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>

        {/* Bottom left dot */}
        <div className="absolute bottom-1/4 left-0 w-1 h-1 rounded-full bg-gray-600 dark:bg-gray-400"></div>

        {/* Bottom dot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-gray-900 dark:bg-gray-100"></div>

        {/* Connection lines */}
        <svg className={`absolute inset-0 ${dotSize}`} viewBox="0 0 48 48">
          <line x1="24" y1="6" x2="24" y2="24" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-600" opacity="0.4"/>
          <line x1="24" y1="24" x2="42" y2="12" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-600" opacity="0.4"/>
          <line x1="24" y1="24" x2="6" y2="12" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-600" opacity="0.4"/>
          <line x1="24" y1="24" x2="42" y2="36" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-600" opacity="0.4"/>
          <line x1="24" y1="24" x2="6" y2="36" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-600" opacity="0.4"/>
          <line x1="24" y1="24" x2="24" y2="42" stroke="currentColor" strokeWidth="0.5" className="text-gray-400 dark:text-gray-600" opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

// Constellation Background Pattern Component
function ConstellationBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="constellation-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Node dots */}
            <circle cx="20" cy="20" r="2" fill="currentColor" className="text-purple-600" />
            <circle cx="180" cy="40" r="1.5" fill="currentColor" className="text-gray-400" />
            <circle cx="100" cy="60" r="1" fill="currentColor" className="text-gray-500" />
            <circle cx="60" cy="120" r="1.5" fill="currentColor" className="text-gray-400" />
            <circle cx="150" cy="150" r="2" fill="currentColor" className="text-purple-500" />
            <circle cx="40" cy="180" r="1" fill="currentColor" className="text-gray-500" />

            {/* Connection lines */}
            <line x1="20" y1="20" x2="100" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" opacity="0.3"/>
            <line x1="100" y1="60" x2="180" y2="40" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" opacity="0.3"/>
            <line x1="100" y1="60" x2="150" y2="150" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" opacity="0.3"/>
            <line x1="60" y1="120" x2="150" y2="150" stroke="currentColor" strokeWidth="0.5" className="text-gray-400" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#constellation-pattern)" />
      </svg>
    </div>
  );
}

export default function ConstellationTestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Mock stats for demo
  const stats = {
    totalSolutions: 3873,
    avgEffectiveness: 4.15,
    totalGoals: 228,
    activeUsersToday: 12
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with Constellation Logo */}
      <header className="border-b-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <ConstellationLogo size="default" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/browse" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
              Browse
            </Link>
            <Link href="/contribute" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
              Contribute
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section with Constellation Theme */}
      <section className="relative bg-gray-900 dark:bg-black py-20 px-4 overflow-hidden">
        {/* Constellation background pattern */}
        <ConstellationBackground />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6">
              Stop guessing.<br className="hidden sm:block" />
              Start solving.
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Connect to worldwide knowledge. Real solutions from real people.
            </p>
          </div>

          {/* Large Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try 'Reduce anxiety' or 'Sleep better'"
                className="w-full px-6 py-4 text-lg bg-white border-2 border-gray-700 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-lg text-gray-900 placeholder-gray-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-6 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors duration-200 font-semibold"
              >
                Search
              </button>
            </form>
          </div>

          {/* Stats with Constellation Dots */}
          <div className="flex flex-wrap justify-center gap-12 text-center mb-8">
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="absolute -top-2 -left-2 w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stats.totalSolutions.toLocaleString()}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-400">Solutions</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="absolute -top-2 -left-2 w-2 h-2 rounded-full bg-purple-600 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stats.avgEffectiveness}★
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-400">Avg Rating</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="absolute -top-2 -left-2 w-2 h-2 rounded-full bg-purple-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stats.totalGoals.toLocaleString()}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-400">Life Goals</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="absolute -top-2 -left-2 w-2 h-2 rounded-full bg-purple-600 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stats.activeUsersToday.toLocaleString()}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-400">Active Today</div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/browse')}
              className="px-6 py-3 bg-transparent text-white border-2 border-white rounded-full font-semibold shadow-md transition-all duration-300 ease-in-out hover:bg-white hover:text-gray-900 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
            >
              Browse All Goals
            </button>
            <button
              onClick={() => router.push('/contribute')}
              className="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold shadow-md transition-all duration-300 ease-in-out hover:bg-purple-700 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              <div className="w-4 h-4 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"></div>
              </div>
              Share What Worked
            </button>
          </div>
        </div>
      </section>

      {/* How It Works Section - Constellation Theme */}
      <section className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white text-center mb-16">
            How the Network Works
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative w-24 h-24">
                  {/* Constellation node visual */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-purple-600 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                    </div>
                  </div>
                  <svg className="absolute inset-0" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="32" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-300 dark:text-purple-700" opacity="0.3" strokeDasharray="4 4"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
                1. Search Your Goal
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find what you're trying to achieve. From "reduce anxiety" to "get promoted."
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative w-24 h-24">
                  {/* Multiple connected nodes */}
                  <svg className="absolute inset-0" viewBox="0 0 96 96">
                    <line x1="48" y1="20" x2="48" y2="48" stroke="currentColor" strokeWidth="1.5" className="text-purple-400 dark:text-purple-600"/>
                    <line x1="48" y1="48" x2="76" y2="48" stroke="currentColor" strokeWidth="1.5" className="text-purple-400 dark:text-purple-600"/>
                    <line x1="48" y1="48" x2="20" y2="48" stroke="currentColor" strokeWidth="1.5" className="text-purple-400 dark:text-purple-600"/>
                    <line x1="48" y1="48" x2="48" y2="76" stroke="currentColor" strokeWidth="1.5" className="text-purple-400 dark:text-purple-600"/>
                    <circle cx="48" cy="20" r="4" fill="currentColor" className="text-purple-600"/>
                    <circle cx="76" cy="48" r="4" fill="currentColor" className="text-purple-600"/>
                    <circle cx="20" cy="48" r="4" fill="currentColor" className="text-purple-600"/>
                    <circle cx="48" cy="76" r="4" fill="currentColor" className="text-purple-600"/>
                    <circle cx="48" cy="48" r="6" fill="currentColor" className="text-purple-600"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
                2. Explore Real Solutions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                See what actually worked for people worldwide, ranked by effectiveness.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="relative w-24 h-24">
                  {/* Growing network */}
                  <svg className="absolute inset-0" viewBox="0 0 96 96">
                    {/* Expanding circles */}
                    <circle cx="48" cy="48" r="12" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600" opacity="0.8"/>
                    <circle cx="48" cy="48" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-500" opacity="0.5"/>
                    <circle cx="48" cy="48" r="36" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-400" opacity="0.3"/>
                    <circle cx="48" cy="48" r="6" fill="currentColor" className="text-purple-600"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
                3. Share Your Experience
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add what worked for you. Help others connect to solutions that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Solutions Section */}
      <section className="relative py-20 px-4 bg-gray-900 dark:bg-black overflow-hidden">
        <ConstellationBackground />

        <div className="relative z-10 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4 text-center">
            Real Solutions, Real Results
          </h2>
          <p className="text-center text-gray-400 mb-12">Connected knowledge from thousands worldwide</p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Solution Card 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Headspace App</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">★ 4.5</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">For: Reduce anxiety</p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                <span className="font-semibold">87 of 132 users</span> found this effective
              </div>
            </div>

            {/* Solution Card 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Melatonin 3mg</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">★ 4.2</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">For: Sleep better</p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                <span className="font-semibold">64 of 98 users</span> found this effective
              </div>
            </div>

            {/* Solution Card 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-xl">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Morning Journaling</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">★ 4.7</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">For: Reduce stress</p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                <span className="font-semibold">112 of 145 users</span> found this effective
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/browse')}
              className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-2xl border-2 border-white"
            >
              Explore All Solutions →
            </button>
          </div>
        </div>
      </section>

      {/* Footer with Constellation Logo */}
      <footer className="bg-gray-900 dark:bg-black border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-6">
            <ConstellationLogo size="small" />
            <p className="text-sm text-gray-400 text-center">
              Connecting worldwide knowledge. Real solutions from real people.
            </p>
            <div className="flex gap-6">
              <Link href="/about" className="text-sm font-semibold text-gray-400 hover:text-purple-400">About</Link>
              <Link href="/browse" className="text-sm font-semibold text-gray-400 hover:text-purple-400">Browse</Link>
              <Link href="/contribute" className="text-sm font-semibold text-gray-400 hover:text-purple-400">Contribute</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
