import React, { FormEvent } from 'react';

interface AuthFormProps {
  onSubmit: (e: FormEvent) => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
}

export default function AuthForm({ onSubmit, children, title, subtitle, footer }: AuthFormProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg p-8">
        {title && <h2 className="text-2xl font-bold text-center mb-2">{title}</h2>}
        {subtitle && <p className="text-gray-600 text-center mb-6">{subtitle}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
