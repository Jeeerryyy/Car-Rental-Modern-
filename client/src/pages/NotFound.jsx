import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-off flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <div className="text-[120px] font-display font-extrabold text-border/40 leading-none mb-4 select-none">
          404
        </div>
        <h1 className="font-display text-3xl font-bold text-dark mb-3">Page Not Found</h1>
        <p className="text-muted mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="btn-primary">Back to Home</Link>
          <Link to="/cars" className="btn-outline">Browse Fleet</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
