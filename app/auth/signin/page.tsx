'use client'

import { useSearchParams } from 'next/navigation'
import SignInForm from '@/components/auth/SignInForm'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          What Worked For Me
        </h2>
      </div>
      
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