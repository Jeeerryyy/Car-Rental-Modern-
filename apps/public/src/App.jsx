import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

const Home              = React.lazy(() => import('./pages/Home'));
const Cars              = React.lazy(() => import('./pages/Cars'));
const CarDetail         = React.lazy(() => import('./pages/CarDetail'));
const DestinationDetail = React.lazy(() => import('./pages/DestinationDetail'));
const Terms             = React.lazy(() => import('./pages/Terms'));
const Privacy           = React.lazy(() => import('./pages/Privacy'));
const Contact           = React.lazy(() => import('./pages/Contact'));
const Profile           = React.lazy(() => import('./pages/Profile'));
const MyBookings        = React.lazy(() => import('./pages/MyBookings'));
const BookingDetail     = React.lazy(() => import('./pages/BookingDetail'));
const SignIn            = React.lazy(() => import('./pages/SignIn'));
const SignUp            = React.lazy(() => import('./pages/SignUp'));
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'));
const NotFound          = React.lazy(() => import('./pages/NotFound'));

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

import { connectSocket, disconnectSocket } from './lib/socket.js';
import { SOCKET_EVENTS } from './lib/socket.events.js';

function PublicShell() {
  const { pathname } = useLocation();
  const { customer } = useAuth();
  const hideChrome = ['/signin', '/signup'].includes(pathname.toLowerCase());
  const isHome = pathname === '/';

  useEffect(() => {
    if (customer) {
      connectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [customer]);

  return (
    <>
      {!hideChrome && <Navbar customer={customer} />}
      <Toaster position="top-right" />
      <div className={!hideChrome && !isHome ? "pt-[76px]" : ""}>
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
              <Route path="/signin"             element={<SignIn />} />
              <Route path="/signup"             element={<SignUp />} />
              <Route path="/profile"            element={<Profile />} />
              <Route path="/my-bookings"        element={<MyBookings />} />
              <Route path="/my-bookings/:id"    element={<BookingDetail />} />
              <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
              <Route path="*"                   element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {!hideChrome && <Footer />}
      </div>
    </>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <Router>
        <ErrorBoundary>
          <ScrollRestoration />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded focus:font-semibold focus:text-sm"
            style={{ background: '#19130E', color: '#F9F8F3' }}
          >
            Skip to main content
          </a>
          <PublicShell />
        </ErrorBoundary>
      </Router>
    </GoogleOAuthProvider>
  );
}
