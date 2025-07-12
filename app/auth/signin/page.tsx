'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SignInForm from '@/components/organisms/auth/SignInForm'

function SignInContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Show error message if present */}
      {error && (
        <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}
      
      <SignInForm />
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  )
}