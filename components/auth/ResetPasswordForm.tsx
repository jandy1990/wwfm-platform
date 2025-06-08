// components/auth/ResetPasswordForm.tsx

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import AuthForm from './AuthForm'
import Link from 'next/link'
import { FormField } from '@/components/auth/FormField'
import { Button } from '@/components/auth/Button'

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Check your email for the password reset link!' 
        })
        setEmail('') // Clear the form
      }
    } catch {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm
      title="Reset your password"
      onSubmit={handleSubmit}
      footer={
        <div className="text-center text-sm">
          Remember your password?{' '}
          <Link href="/auth/signin" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
            Sign in
          </Link>
        </div>
      }
    >
      {/* Show message if exists */}
      {message && (
        <div className={`mb-4 p-3 rounded text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700' 
            : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <FormField label="Email address" required>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          placeholder="Enter your email"
        />
      </FormField>

      <Button
        type="submit"
        disabled={loading}
        className="w-full mt-6"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </AuthForm>
  )
}