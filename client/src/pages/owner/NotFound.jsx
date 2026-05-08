import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="text-center max-w-lg flex flex-col items-center gap-8">
        {/* Large 404 */}
        <div className="relative">
          <span className="text-[160px] md:text-[200px] font-headline-xl font-light text-outline-variant leading-none select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl md:text-7xl text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              directions_car
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-headline-lg text-headline-lg text-primary font-medium">Page Not Found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            to="/owner/dashboard"
            className="bg-primary-container text-on-primary rounded-full py-3 px-6 font-body-md text-body-md font-medium hover:bg-surface-tint transition-colors text-center flex-1"
          >
            Go to Dashboard
          </Link>
          <Link
            to="/"
            className="border border-outline-variant text-primary rounded-full py-3 px-6 font-body-md text-body-md hover:bg-surface-container transition-colors text-center flex-1"
          >
            Home Page
          </Link>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Need help? <a href="#" className="text-primary font-medium hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
