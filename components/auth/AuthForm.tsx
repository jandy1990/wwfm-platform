// components/auth/AuthForm.tsx
import React, { ReactNode } from 'react';

interface AuthFormProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AuthForm({ title, children, footer, onSubmit }: AuthFormProps) {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">{title}</h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
      
      {footer && (
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          {footer}
        </div>
      )}
    </div>
  );
}