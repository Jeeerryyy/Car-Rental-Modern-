export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <Skeleton className="h-32 w-full mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100">
          <Skeleton className="w-24 h-24 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-1/3 mt-4" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 p-4 bg-gray-50 rounded-t-lg">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-t border-gray-100">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
          <Skeleton className="h-3 w-1/2 mb-2" />
          <Skeleton className="h-8 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}