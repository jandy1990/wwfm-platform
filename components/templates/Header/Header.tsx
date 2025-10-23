'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/database/client'
import { User } from '@supabase/supabase-js'
import HeaderSearch from '@/components/organisms/HeaderSearch'
import MobileSearchModal from '@/components/organisms/MobileSearchModal'
import MobileNav from '@/components/organisms/MobileNav'
import UserDropdown from '@/components/organisms/UserDropdown'
import NotificationBell from '@/components/organisms/NotificationBell'
import { PointsBadge } from '@/components/points/PointsBadge'

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
          <div className="flex items-center h-16 relative">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">
                WWFM<sup className="text-[0.5em] font-normal ml-0.5">™</sup>
              </span>
            </Link>

            {/* Desktop Search - Between logo and nav */}
            <HeaderSearch className="hidden md:block ml-8" />

            {/* Navigation Links - Absolutely Centered */}
            <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 -translate-x-1/2">
              <Link
                href="/browse"
                className={`pb-1 transition-colors border-b-2 ${
                  pathname === '/browse'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                aria-current={pathname === '/browse' ? 'page' : undefined}
              >
                Browse
              </Link>
              <Link
                href="/dashboard"
                className={`pb-1 transition-colors border-b-2 ${
                  pathname === '/dashboard'
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-semibold'
                    : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                aria-current={pathname === '/dashboard' ? 'page' : undefined}
              >
                Dashboard
              </Link>
              {user && (
                <Link
                  href="/contribute"
                  className={`pb-1 transition-colors border-b-2 ${
                    pathname === '/contribute'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-semibold'
                      : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  aria-current={pathname === '/contribute' ? 'page' : undefined}
                >
                  Contribute
                </Link>
              )}
            </nav>

            {/* Auth Section + Mobile Search Icon */}
            <div className="flex items-center space-x-4 ml-auto">
              {/* Mobile Search Icon - Hidden on pages with their own search */}
              {!shouldHideSearch && (
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )}
            {user ? (
              <>
                <PointsBadge userId={user.id} />
                <NotificationBell count={retrospectiveCount} />
                <UserDropdown
                  user={user}
                  onSignOut={handleSignOut}
                  retrospectiveCount={retrospectiveCount}
                />
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
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
      <MobileSearchModal
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