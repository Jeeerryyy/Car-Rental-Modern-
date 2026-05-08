import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { ExploreIcon } from './components/ui/Icons';
import { Toaster } from 'react-hot-toast';
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Lazy-loaded pages — public facing
const Home              = React.lazy(() => import('./pages/Home'));
const Cars              = React.lazy(() => import('./pages/Cars'));
const CarDetail         = React.lazy(() => import('./pages/CarDetail'));
const DestinationDetail = React.lazy(() => import('./pages/DestinationDetail'));
const Terms             = React.lazy(() => import('./pages/Terms'));
const Privacy           = React.lazy(() => import('./pages/Privacy'));
const Contact           = React.lazy(() => import('./pages/Contact'));
const Profile           = React.lazy(() => import('./pages/Profile'));
const MyBookings        = React.lazy(() => import('./pages/MyBookings'));
const CustomerSignIn    = React.lazy(() => import('./pages/customer/SignIn'));
const CustomerSignUp    = React.lazy(() => import('./pages/customer/SignUp'));

// Lazy-loaded pages — owner CRM portal
const OwnerLayout    = React.lazy(() => import('./components/owner/OwnerLayout'));
const Dashboard      = React.lazy(() => import('./pages/owner/Dashboard'));
const Fleet          = React.lazy(() => import('./pages/owner/Fleet'));
const Bookings       = React.lazy(() => import('./pages/owner/Bookings'));
const AddCar         = React.lazy(() => import('./pages/owner/AddCar'));
const FleetDetail     = React.lazy(() => import('./pages/owner/FleetDetail'));
const Clients        = React.lazy(() => import('./pages/owner/Clients'));
const SignIn         = React.lazy(() => import('./pages/owner/SignIn'));
const SignUp         = React.lazy(() => import('./pages/owner/SignUp'));
const OwnerNotFound  = React.lazy(() => import('./pages/owner/NotFound'));

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

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <span className="text-2xl font-extrabold tracking-tight text-dark">M</span>
      <div className="w-7 h-7 border-[3px] border-dark border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function OwnerPageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">M</div>
        <div className="w-6 h-6 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

function PublicShell() {
  return (
    <>
      <Navbar />
      <Toaster position="top-right" />

      {/* Standard top padding for navbar offset */}
      <div className="pt-[72px]">
        <main id="main-content">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"                   element={<Home />} />
              <Route path="/cars"               element={<Cars />} />
              <Route path="/cars/:id"           element={<CarDetail />} />
              <Route path="/contact"            element={<Contact />} />
              <Route path="/destinations/:slug" element={<DestinationDetail />} />
              <Route path="/terms"              element={<Terms />} />
              <Route path="/privacy"            element={<Privacy />} />
              <Route path="/signin"             element={<CustomerSignIn />} />
              <Route path="/signup"            element={<CustomerSignUp />} />
              <Route path="/profile"            element={<Profile />} />
              <Route path="/my-bookings"        element={<MyBookings />} />
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
        <Footer />
      </div>
    </>
  );
}

function AppShell() {
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

      <Suspense fallback={<OwnerPageLoader />}>
        <Routes>
          {/* ── Owner CRM Portal (standalone auth pages) ── */}
          <Route path="/owner/signin" element={<SignIn />} />
          <Route path="/owner/signup" element={<SignUp />} />

          {/* ── Owner CRM Portal (layout-wrapped pages) ── */}
          <Route path="/owner" element={<ProtectedRoute requireOwner><OwnerLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="fleet/:id" element={<FleetDetail />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="add-car" element={<AddCar />} />
            <Route path="clients" element={<Clients />} />
            <Route path="*" element={<OwnerNotFound />} />
          </Route>

          {/* ── Public site (Navbar + Footer shell) ── */}
          <Route path="/*" element={<PublicShell />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <CustomerAuthProvider>
            <AppShell />
          </CustomerAuthProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}
