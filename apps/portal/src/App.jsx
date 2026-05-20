import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useOwnerAuth } from './context/OwnerAuthContext.jsx';

const SignIn     = React.lazy(() => import('./pages/SignIn'));
const Dashboard  = React.lazy(() => import('./pages/Dashboard'));
const Fleet     = React.lazy(() => import('./pages/Fleet'));
const FleetDetail = React.lazy(() => import('./pages/FleetDetail'));
const AddCar    = React.lazy(() => import('./pages/AddCar'));
const AddBike   = React.lazy(() => import('./pages/AddBike'));
const Bookings  = React.lazy(() => import('./pages/Bookings'));
const AddBooking = React.lazy(() => import('./pages/AddBooking'));
const Clients   = React.lazy(() => import('./pages/Clients'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Profile   = React.lazy(() => import('./pages/Profile'));
const Settings  = React.lazy(() => import('./pages/Settings'));
const Support   = React.lazy(() => import('./pages/Support'));
const Promos    = React.lazy(() => import('./pages/Promos'));
const Reviews   = React.lazy(() => import('./pages/Reviews'));
const Reports   = React.lazy(() => import('./pages/Reports'));
const BookingCalendar = React.lazy(() => import('./pages/BookingCalendar'));
const NotFound  = React.lazy(() => import('./pages/NotFound'));
const OwnerLayout = React.lazy(() => import('./components/layout/OwnerLayout'));

const Cars          = React.lazy(() => import('./pages/public/Cars'));
const CarDetails    = React.lazy(() => import('./pages/public/CarDetails/CarDetails'));
const Login         = React.lazy(() => import('./pages/public/Login'));
const OTPVerification = React.lazy(() => import('./pages/public/OTPVerification'));
const CustomerLayout = React.lazy(() => import('./components/public/CustomerLayout'));

function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useOwnerAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-6 h-6 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  return children;
}

function RedirectAuth({ children }) {
  const { isAuthenticated, isLoading } = useOwnerAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

function RootRedirect() {
  const { isAuthenticated, isLoading } = useOwnerAuth();
  if (isLoading) return <LoadingScreen />;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/signin'} replace />;
}

function ScrollRestoration() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">M</div>
        <div className="w-6 h-6 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-lg">M</div>
        <div className="w-6 h-6 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollRestoration />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public site: anyone can view without login ── */}
          <Route element={<CustomerLayout />}>
            <Route path="/cars" element={<Cars />} />
          </Route>

          {/* ── Home: redirect based on auth ── */}
          <Route path="/" element={<RootRedirect />} />

          {/* ── Car details (view without login, booking behind auth) ── */}
          <Route element={<CustomerLayout />}>
            <Route path="/cars/:id" element={<CarDetails />} />
          </Route>

          {/* ── Customer auth: login/verify (inside CustomerLayout which has CustomerAuthProvider) ── */}
          <Route element={<CustomerLayout />}>
            <Route path="/login"         element={<Login />} />
            <Route path="/verify-otp"    element={<OTPVerification />} />
          </Route>

          {/* ── Owner portal signin ── */}
          <Route path="/signin" element={<RedirectAuth><SignIn /></RedirectAuth>} />

          {/* ── Protected owner routes ── */}
          <Route element={<RequireAuth><OwnerLayout /></RequireAuth>}>
            <Route path="/dashboard"      element={<Dashboard />} />
            <Route path="/fleet"          element={<Fleet />} />
            <Route path="/fleet/add"      element={<AddCar />} />
            <Route path="/fleet/add-bike" element={<AddBike />} />
            <Route path="/fleet/:id"     element={<FleetDetail />} />
            <Route path="/bookings"      element={<Bookings />} />
            <Route path="/bookings/new"  element={<AddBooking />} />
            <Route path="/clients"       element={<Clients />} />
            <Route path="/notifications"   element={<Notifications />} />
            <Route path="/profile"       element={<Profile />} />
            <Route path="/settings"       element={<Settings />} />
            <Route path="/support"       element={<Support />} />
            <Route path="/promos"         element={<Promos />} />
            <Route path="/reviews"        element={<Reviews />} />
            <Route path="/reports"        element={<Reports />} />
            <Route path="/calendar"       element={<BookingCalendar />} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
