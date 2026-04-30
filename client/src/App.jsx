import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute, { AdminRoute } from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/layout/ErrorBoundary';

import Home from './pages/Home';
import Auth from './pages/Auth';

const Cars      = React.lazy(() => import('./pages/Cars'));
const CarDetail = React.lazy(() => import('./pages/CarDetail'));
const Profile   = React.lazy(() => import('./pages/Profile'));
const Terms     = React.lazy(() => import('./pages/Terms'));
const Privacy   = React.lazy(() => import('./pages/Privacy'));
const Analytics = React.lazy(() => import('./pages/admin/Analytics'));
const Fleet     = React.lazy(() => import('./pages/admin/Fleet'));
const Bookings  = React.lazy(() => import('./pages/admin/Bookings'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <span className="text-2xl font-extrabold tracking-tight text-dark">M</span>
      <div className="w-7 h-7 border-[3px] border-dark border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-dark focus:rounded focus:shadow-lg focus:font-semibold focus:text-sm"
          >
            Skip to main content
          </a>

          <div className="pt-[72px]">
            <Navbar />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"            element={<Home />} />
                <Route path="/auth"        element={<Auth />} />
                <Route path="/cars"        element={<Cars />} />
                <Route path="/cars/:id"    element={<CarDetail />} />
                <Route path="/terms"       element={<Terms />} />
                <Route path="/privacy"     element={<Privacy />} />
                <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
                <Route path="/admin/fleet"     element={<AdminRoute><Fleet /></AdminRoute>} />
                <Route path="/admin/bookings"  element={<AdminRoute><Bookings /></AdminRoute>} />
                <Route path="*" element={
                  <main id="main-content" className="min-h-screen flex flex-col items-center justify-center bg-off text-center px-6">
                    <span className="material-symbols-outlined text-6xl text-muted mb-4">explore_off</span>
                    <h1 className="font-display text-4xl font-bold text-dark mb-2">Page Not Found</h1>
                    <p className="text-muted mb-6 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
                    <Link to="/" className="btn-primary">Back to Home</Link>
                  </main>
                } />
              </Routes>
            </Suspense>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
