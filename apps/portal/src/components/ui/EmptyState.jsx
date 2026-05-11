import { Link } from 'react-router-dom';

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionLink,
  onAction 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl text-gray-400">{icon}</span>
        </div>
      )}
      <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      )}
      {actionLabel && (
        onAction ? (
          <button onClick={onAction} className="btn-primary">
            {actionLabel}
          </button>
        ) : actionLink ? (
          <Link to={actionLink} className="btn-primary">
            {actionLabel}
          </Link>
        ) : null
      )}
    </div>
  );
}

export function ErrorState({ 
  title = 'Something went wrong', 
  message = 'Please try again later',
  onRetry 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-4xl text-red-400">error</span>
      </div>
      <h3 className="text-xl font-bold text-dark mb-2">{title}</h3>
      <p className="text-gray-500 mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}