import { Link } from 'react-router-dom';
import { ExploreIcon } from '../components/ui/Icons';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 relative overflow-hidden" style={{ background: '#F9F8F3' }}>
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px]" style={{ background: '#19130E' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ border: '1px solid #19130E' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ border: '1px solid #19130E' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-50" style={{ border: '1px solid #19130E' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="relative inline-block mb-2">
          <span className="text-[140px] md:text-[220px] font-black leading-none tracking-tighter select-none opacity-5" style={{ color: '#19130E' }}>404</span>
          <div className="absolute inset-0 flex items-center justify-center translate-y-4">
            <ExploreIcon className="w-24 h-24 md:w-32 md:h-32 opacity-10" style={{ color: '#B67C3D' }} />
          </div>
        </div>

        <div className="mt-[-40px] md:mt-[-80px]">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: '#19130E' }}>Lost in transit?</h1>
          <p className="text-lg md:text-xl max-w-md mx-auto mb-10 font-medium" style={{ color: '#6b5e50' }}>The road you're looking for doesn't exist on our map. Let's get you back in the driver's seat.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-[15px] no-underline" style={{ background: '#19130E', color: '#F9F8F3' }}>Return to Home</Link>
            <Link to="/cars" className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-[15px] no-underline" style={{ background: '#F9F8F3', color: '#19130E', border: '2px solid rgba(25,19,14,0.1)' }}>Browse Fleet</Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 opacity-40">
            <Link to="/contact" className="text-xs font-bold tracking-widest uppercase no-underline" style={{ color: '#19130E' }}>Support</Link>
            <Link to="/terms" className="text-xs font-bold tracking-widest uppercase no-underline" style={{ color: '#19130E' }}>Terms</Link>
            <Link to="/privacy" className="text-xs font-bold tracking-widest uppercase no-underline" style={{ color: '#19130E' }}>Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
