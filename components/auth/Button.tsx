interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px] flex items-center justify-center disabled:hover:scale-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}