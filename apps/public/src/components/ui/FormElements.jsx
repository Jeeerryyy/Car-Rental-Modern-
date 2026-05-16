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
        <label className="block text-sm font-medium" style={{ color: '#19130E' }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className="w-full px-4 py-3 rounded-[8px] outline-none"
        style={{
          background: error ? 'rgba(185,28,28,0.05)' : '#F2EEE5',
          color: '#19130E',
          border: error ? '1px solid #b91c1c' : '1px solid rgba(182,124,61,0.15)',
        }}
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
        <label className="block text-sm font-medium" style={{ color: '#19130E' }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className="w-full px-4 py-3 rounded-[8px] outline-none resize-none"
        style={{
          background: error ? 'rgba(185,28,28,0.05)' : '#F2EEE5',
          color: '#19130E',
          border: error ? '1px solid #b91c1c' : '1px solid rgba(182,124,61,0.15)',
        }}
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
        <label className="block text-sm font-medium" style={{ color: '#19130E' }}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className="w-full px-4 py-3 rounded-[8px] outline-none appearance-none cursor-pointer"
        style={{
          background: error ? 'rgba(185,28,28,0.05)' : '#F2EEE5',
          color: '#19130E',
          border: error ? '1px solid #b91c1c' : '1px solid rgba(182,124,61,0.15)',
        }}
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
      className={`w-full font-bold py-4 rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
      style={{ background: '#19130E', color: '#FFFFFF' }}
      {...props}
    >
      {loading && (
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(220,207,186,0.3)', borderTopColor: '#FFFFFF' }} />
      )}
      {children}
    </button>
  );
}
