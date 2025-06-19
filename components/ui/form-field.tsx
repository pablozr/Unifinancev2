interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | string[]
  description?: string
}

export function FormField({ label, error, description, className = '', ...props }: FormFieldProps) {
  const hasError = error && (Array.isArray(error) ? error.length > 0 : error.length > 0)
  const errorMessages = Array.isArray(error) ? error : error ? [error] : []

  return (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-gray-300 mb-2">
        {label}
        {props.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        className={`block w-full px-4 py-3 bg-gray-800/50 border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:bg-gray-800/30 disabled:cursor-not-allowed text-white placeholder-gray-400 ${
          hasError
            ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50'
            : 'border-gray-700/50 hover:border-gray-600/50'
        } ${className}`}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={hasError ? `${props.id}-error` : description ? `${props.id}-description` : undefined}
        {...props}
      />
      {description && !hasError && (
        <p id={`${props.id}-description`} className="text-sm text-gray-400 mt-2">
          {description}
        </p>
      )}
      {hasError && (
        <div id={`${props.id}-error`} className="mt-2">
          {errorMessages.map((msg, index) => (
            <p key={index} className="text-sm text-red-400">
              {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
