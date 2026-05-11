export function FormInput({ 
  label, 
  error, 
  required, 
  className = '',
  ...props 
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-dark">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-lg border ${
          error 
            ? 'border-red-500 focus:border-red-500 bg-red-50' 
            : 'border-gray-200 focus:border-dark bg-white'
        } outline-none transition-colors`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

export function FormTextarea({ 
  label, 
  error, 
  required, 
  className = '',
  ...props 
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-dark">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-3 rounded-lg border ${
          error 
            ? 'border-red-500 focus:border-red-500 bg-red-50' 
            : 'border-gray-200 focus:border-dark bg-white'
        } outline-none transition-colors resize-none`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

export function FormSelect({ 
  label, 
  error, 
  required, 
  options = [],
  placeholder,
  className = '',
  ...props 
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-dark">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-lg border ${
          error 
            ? 'border-red-500 focus:border-red-500 bg-red-50' 
            : 'border-gray-200 focus:border-dark bg-white'
        } outline-none transition-colors appearance-none cursor-pointer`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ 
  loading, 
  children, 
  disabled,
  className = '',
  ...props 
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`w-full bg-dark text-white font-bold py-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}