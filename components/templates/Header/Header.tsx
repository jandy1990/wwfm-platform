'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/database/client'
import { User } from '@supabase/supabase-js'
import UnifiedSearchBar from '@/components/organisms/UnifiedSearchBar'
import MobileNav from '@/components/organisms/MobileNav'
import NotificationBell from '@/components/organisms/NotificationBell'
import ProgressRingAvatar from '@/components/organisms/ProgressRingAvatar'

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [retrospectiveCount, setRetrospectiveCount] = useState(0)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)

  // Hide search on pages that already have their own search
  const shouldHideSearch = pathname === '/' || pathname === '/browse'

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Load retrospective count if user is logged in
    if (user) {
      loadRetrospectiveCount()
    } else {
      setRetrospectiveCount(0)
    }
  }, [user])

  const loadRetrospectiveCount = async () => {
    try {
      const { getUnreadRetrospectiveCount } = await import('@/app/actions/retrospectives')
      const count = await getUnreadRetrospectiveCount()
      setRetrospectiveCount(count)
    } catch (error) {
      console.error('Error loading retrospective count:', error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100 flex items-start">
                WWFM<span className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-400 dark:to-purple-600 ml-0.5 sm:ml-1 mt-1.5 sm:mt-2"></span>
              </span>
            </Link>

            {/* Desktop Search */}
            {!shouldHideSearch && (
              <div className="hidden md:block ml-8">
                <UnifiedSearchBar variant="desktop" />
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-2 mr-4">
              <Link
                href="/browse"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  pathname === '/browse'
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                aria-current={pathname === '/browse' ? 'page' : undefined}
              >
                Explore
              </Link>
              <Link
                href="/how-it-works"
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                  pathname === '/how-it-works'
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                aria-current={pathname === '/how-it-works' ? 'page' : undefined}
              >
                How It Works
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                    pathname === '/dashboard'
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                  aria-current={pathname === '/dashboard' ? 'page' : undefined}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Auth Section + Mobile Search Icon */}
            <div className="flex items-center space-x-3">
              {/* Mobile Search Icon - Hidden on pages with their own search */}
              {!shouldHideSearch && (
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center
                             text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400
                             rounded-md transition-colors
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            {user ? (
              <>
                <NotificationBell count={retrospectiveCount} />
                <ProgressRingAvatar
                  user={user}
                  onSignOut={handleSignOut}
                  retrospectiveCount={retrospectiveCount}
                />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2.5 min-h-[44px] flex items-center
                             text-sm text-gray-700 dark:text-gray-300
                             hover:text-purple-600 dark:hover:text-purple-400
                             hover:bg-gray-100 dark:hover:bg-gray-800
                             rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-3 min-h-[44px] flex items-center
                             text-sm bg-purple-600 hover:bg-purple-700 text-white
                             rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                type="button"
                onClick={() => setShowMobileNav(true)}
                className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-md p-2"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <UnifiedSearchBar
        variant="mobile"
        isOpen={showMobileSearch}
        onClose={() => setShowMobileSearch(false)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={showMobileNav}
        onClose={() => setShowMobileNav(false)}
        user={user}
        onSignOut={handleSignOut}
        retrospectiveCount={retrospectiveCount}
      />
    </>
  )
}