interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700',
    secondary: 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50 hover:border-gray-600/50'
  }

  return (
    <button
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          <span>{children}</span>
        </div>
      )}
      {!loading && children}
    </button>
  )
}
