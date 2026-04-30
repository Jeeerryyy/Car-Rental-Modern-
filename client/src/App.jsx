import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute, { AdminRoute } from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/layout/ErrorBoundary';
import TermsModal from './components/layout/TermsModal';
import { ExploreIcon } from './components/ui/Icons';
import { Toaster } from 'react-hot-toast';
import React from 'react';
import OwnerLayout from './components/owner/OwnerLayout';
const OwnerDashboard = React.lazy(() => import('./pages/owner/Dashboard'));
const OwnerFleet = React.lazy(() => import('./pages/owner/Fleet'));
const OwnerBookings = React.lazy(() => import('./pages/owner/Bookings'));
const OwnerCustomers = React.lazy(() => import('./pages/owner/Customers'));
const OwnerAnalytics = React.lazy(() => import('./pages/owner/Analytics'));
const OwnerSettings = React.lazy(() => import('./pages/owner/Settings'));
const OwnerEvents    = React.lazy(() => import('./pages/owner/EventManagement'));
const OwnerVenues    = React.lazy(() => import('./pages/owner/VenueManagement'));
const OwnerSchedules = React.lazy(() => import('./pages/owner/ScheduleManagement'));
const OwnerPromos    = React.lazy(() => import('./pages/owner/Promos'));
const OwnerAuth      = React.lazy(() => import('./pages/owner/OwnerAuth'));
const VehicleProfile = React.lazy(() => import('./pages/owner/VehicleProfile'));

// Lazy-loaded pages — all page-level code-split for optimal bundle
const Home              = React.lazy(() => import('./pages/Home'));
const Auth              = React.lazy(() => import('./pages/Auth'));
const Cars              = React.lazy(() => import('./pages/Cars'));
const CarDetail         = React.lazy(() => import('./pages/CarDetail'));
const DestinationDetail = React.lazy(() => import('./pages/DestinationDetail'));
const Profile           = React.lazy(() => import('./pages/Profile'));
const Terms             = React.lazy(() => import('./pages/Terms'));
const Privacy           = React.lazy(() => import('./pages/Privacy'));
const Contact           = React.lazy(() => import('./pages/Contact'));

// Routes where the Navbar and Footer should be completely hidden
// (full-screen flows, auth page, owner CRM which has its own sidebar)
const SHELL_HIDDEN_PREFIXES = ['/auth', '/owner'];

function useShellHidden() {
  const { pathname } = useLocation();
  return SHELL_HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function ScrollRestoration() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [hash, pathname]);
  return null;
}

function ConditionalNavbar() {
  const hidden = useShellHidden();
  const { pathname } = useLocation();
  if (hidden) return null;
  if (pathname.startsWith('/admin')) return null;
  return <Navbar />;
}

function ConditionalFooter() {
  const { pathname } = useLocation();
  // Hide footer on auth page, profile (has its own layout), and admin flows
  const hidden =
    SHELL_HIDDEN_PREFIXES.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin');
  if (hidden) return null;
  return <Footer />;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <span className="text-2xl font-extrabold tracking-tight text-dark">M</span>
      <div className="w-7 h-7 border-[3px] border-dark border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppShell() {
  const shellHidden = useShellHidden();
  const { pathname } = useLocation();
  // Profile page = full-screen, no top padding (has its own header)
  const isFullScreen = pathname.startsWith('/profile') || pathname.startsWith('/admin');

  return (
    <>
      <ScrollRestoration />

      {/* Accessibility skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-dark focus:rounded focus:shadow-lg focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>

      <ConditionalNavbar />
      <TermsModal />
      <Toaster position="top-right" />

      {/* Only add navbar top-padding offset when navbar is visible and not full-screen */}
      <div className={!shellHidden && !isFullScreen ? 'pt-[72px]' : ''}>
        <main id="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"                   element={<Home />} />
              <Route path="/auth"               element={<Auth />} />
              <Route path="/cars"               element={<Cars />} />
              <Route path="/cars/:id"           element={<CarDetail />} />
              <Route path="/contact"            element={<Contact />} />
              <Route path="/destinations/:slug" element={<DestinationDetail />} />
              <Route path="/terms"              element={<Terms />} />
              <Route path="/privacy"            element={<Privacy />} />
              <Route
                path="/profile"
                element={<ProtectedRoute><Profile /></ProtectedRoute>}
              />
              {/* Owner CRM Routes */}
              <Route path="/owner/login" element={<OwnerAuth />} />
              <Route path="/owner" element={<AdminRoute><OwnerLayout /></AdminRoute>}>
                <Route index element={<OwnerDashboard />} />
                <Route path="fleet" element={<OwnerFleet />} />
                <Route path="fleet/:id" element={<VehicleProfile />} />
                <Route path="bookings" element={<OwnerBookings />} />
                <Route path="customers" element={<OwnerCustomers />} />
                <Route path="analytics" element={<OwnerAnalytics />} />
                <Route path="settings" element={<OwnerSettings />} />
                <Route path="promos" element={<OwnerPromos />} />
                <Route path="events" element={<OwnerEvents />} />
                <Route path="venues" element={<OwnerVenues />} />
                <Route path="schedules" element={<OwnerSchedules />} />
              </Route>
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex flex-col items-center justify-center bg-off text-center px-6 relative overflow-hidden">
                    {/* Decorative background circles */}
                    <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-dark/[0.03] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-dark/[0.03] translate-x-1/3 translate-y-1/3 pointer-events-none" />

                    {/* 404 number */}
                    <p className="font-display text-[120px] md:text-[180px] font-extrabold text-dark/[0.06] leading-none select-none mb-0 -mb-8 md:-mb-14">404</p>

                    {/* Icon */}
                    <div className="w-20 h-20 bg-dark rounded-full flex items-center justify-center mb-6 shadow-xl shadow-dark/10">
                      <ExploreIcon className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl font-bold text-dark mb-3">Page Not Found</h1>
                    <p className="text-muted mb-10 max-w-md text-base leading-relaxed">
                      The road you took doesn&apos;t exist on our map. Let&apos;s get you back on track.
                    </p>

                    <div className="flex flex-wrap gap-3 justify-center">
                      <Link to="/" className="btn-primary">Back to Home</Link>
                      <Link to="/cars" className="btn-outline">Browse Fleet</Link>
                      <Link to="/contact" className="btn-outline">Contact Us</Link>
                    </div>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <ConditionalFooter />
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}
