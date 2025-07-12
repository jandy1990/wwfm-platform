import React from 'react';
import { Label } from '@/components/atoms/label';
import { Input } from '@/components/atoms/input';

interface FormFieldProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? 'border-red-500' : ''}
        required={required}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
