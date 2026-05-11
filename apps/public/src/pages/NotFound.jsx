import { Link } from 'react-router-dom';
import { ExploreIcon } from '../components/ui/Icons';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-white text-center px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-dark rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-dark rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-dark rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-dark rounded-full opacity-50" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="relative inline-block mb-2">
          <span className="text-[140px] md:text-[220px] font-black leading-none tracking-tighter text-dark select-none opacity-5">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center translate-y-4">
            <ExploreIcon className="w-24 h-24 md:w-32 md:h-32 text-dark opacity-10 animate-pulse" />
          </div>
        </div>

        <div className="mt-[-40px] md:mt-[-80px]">
          <h1 className="text-4xl md:text-5xl font-extrabold text-dark tracking-tight mb-4">
            Lost in transit?
          </h1>
          <p className="text-muted text-lg md:text-xl max-w-md mx-auto mb-10 font-medium">
            The road you're looking for doesn't exist on our map. Let's get you back in the driver's seat.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="w-full sm:w-auto px-8 py-4 bg-dark text-white rounded-full font-bold text-[15px] shadow-2xl shadow-dark/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Return to Home
            </Link>
            <Link
              to="/cars"
              className="w-full sm:w-auto px-8 py-4 bg-white text-dark border-2 border-dark/10 rounded-full font-bold text-[15px] hover:border-dark transition-all"
            >
              Browse Fleet
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <Link to="/contact" className="text-xs font-bold tracking-widest uppercase hover:text-dark">Support</Link>
            <Link to="/terms" className="text-xs font-bold tracking-widest uppercase hover:text-dark">Terms</Link>
            <Link to="/privacy" className="text-xs font-bold tracking-widest uppercase hover:text-dark">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
