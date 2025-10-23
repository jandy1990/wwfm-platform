'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSignOut: () => void
  retrospectiveCount?: number
}

export default function MobileNav({
  isOpen,
  onClose,
  user,
  onSignOut,
  retrospectiveCount = 0
}: MobileNavProps) {
  const pathname = usePathname()

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Helper to check if link is active
  const isActive = (path: string) => pathname === path

  // Helper to get link classes
  const getLinkClasses = (path: string) => {
    const base = "block px-4 py-4 text-base font-medium transition-colors border-l-4"
    const active = "border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
    const inactive = "border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"

    return `${base} ${isActive(path) ? active : inactive}`
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 w-4/5 max-w-xs
                   bg-white dark:bg-gray-900
                   shadow-2xl
                   md:hidden
                   transform transition-transform duration-300 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-600 dark:text-gray-400
                     hover:text-gray-900 dark:hover:text-gray-100
                     hover:bg-gray-100 dark:hover:bg-gray-800
                     rounded-md transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <Link
            href="/"
            onClick={onClose}
            className={getLinkClasses('/')}
            aria-current={isActive('/') ? 'page' : undefined}
          >
            🏠 Home
          </Link>

          <Link
            href="/browse"
            onClick={onClose}
            className={getLinkClasses('/browse')}
            aria-current={isActive('/browse') ? 'page' : undefined}
          >
            🔍 Browse
          </Link>

          <Link
            href="/dashboard"
            onClick={onClose}
            className={getLinkClasses('/dashboard')}
            aria-current={isActive('/dashboard') ? 'page' : undefined}
          >
            📊 Dashboard
          </Link>

          {retrospectiveCount > 0 && (
            <Link
              href="/mailbox"
              onClick={onClose}
              className={getLinkClasses('/mailbox')}
              aria-current={isActive('/mailbox') ? 'page' : undefined}
            >
              <div className="flex items-center justify-between">
                <span>💭 Reflections</span>
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {retrospectiveCount}
                </span>
              </div>
            </Link>
          )}

          {user && (
            <Link
              href="/contribute"
              onClick={onClose}
              className={getLinkClasses('/contribute')}
              aria-current={isActive('/contribute') ? 'page' : undefined}
            >
              ✨ Share What Worked
            </Link>
          )}
        </nav>

        {/* Auth Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Signed in
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  onSignOut()
                  onClose()
                }}
                className="w-full px-4 py-2 text-sm font-medium
                         text-gray-700 dark:text-gray-300
                         bg-white dark:bg-gray-700
                         border border-gray-300 dark:border-gray-600
                         rounded-md
                         hover:bg-gray-50 dark:hover:bg-gray-600
                         transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/auth/signin"
                onClick={onClose}
                className="block w-full px-4 py-2 text-sm font-medium text-center
                         text-gray-700 dark:text-gray-300
                         bg-white dark:bg-gray-700
                         border border-gray-300 dark:border-gray-600
                         rounded-md
                         hover:bg-gray-50 dark:hover:bg-gray-600
                         transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={onClose}
                className="block w-full px-4 py-2 text-sm font-medium text-center
                         text-white
                         bg-purple-600
                         rounded-md
                         hover:bg-purple-700
                         transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
