// components/auth/SignUpForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/database/client';
import AuthForm from './AuthForm';
import Link from 'next/link';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    try {
      // Create the user in Supabase Auth
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
          }
        }
      });
      
      if (error) throw error;
      
      // Set success message
      setMessage({
        type: 'success',
        text: 'Registration successful! Please check your email to verify your account.'
      });
      
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: (error as Error)?.message || 'An error occurred during registration.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthForm 
      title="Create an Account" 
      onSubmit={handleSignUp}
      footer={
        <p>
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-purple-600 dark:text-purple-400 hover:underline">
            Sign In
          </Link>
        </p>
      }
    >
      {message && (
        <div className={`p-3 rounded ${message.type === 'error' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'}`}>
          {message.text}
        </div>
      )}
      
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-3 py-2 min-h-[44px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          required
        />
      </div>
      
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
          minLength={8}
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password must be at least 8 characters</p>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 min-h-[44px] bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-purple-400 dark:disabled:bg-blue-800 text-white font-medium rounded-md transition-colors"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </AuthForm>
  );
}