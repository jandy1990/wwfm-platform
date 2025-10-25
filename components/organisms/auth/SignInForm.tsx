// components/auth/SignInForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/database/client';
import AuthForm from './AuthForm';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Redirect to the specified page or dashboard after successful login
      router.push(redirectTo || '/dashboard');
      
    } catch (error: unknown) {
      setError((error as Error)?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthForm 
      title="Sign In" 
      onSubmit={handleSignIn}
      footer={
        <div className="space-y-2">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-purple-600 dark:text-purple-400 hover:underline">
              Sign Up
            </Link>
          </p>
          <p>
            <Link href="/auth/reset-password" className="text-purple-600 dark:text-purple-400 hover:underline">
              Forgot your password?
            </Link>
          </p>
        </div>
      }
    >
      {error && (
        <div className="p-3 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 min-h-[44px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 min-h-[44px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 min-h-[44px] bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-purple-400 dark:disabled:bg-blue-800 text-white font-medium rounded-md transition-colors"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </AuthForm>
  );
}