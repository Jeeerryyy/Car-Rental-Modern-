import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/layout/ErrorBoundary';
import { useAuth } from './context/AuthContext.jsx';
import CookiesPopup from './components/shared/CookiesPopup';
import PromoPopup from './components/shared/PromoPopup';

const Home              = React.lazy(() => import('./pages/Home'));
const Cars              = React.lazy(() => import('./pages/Cars'));
const CarDetail         = React.lazy(() => import('./pages/CarDetail'));
const DestinationDetail = React.lazy(() => import('./pages/DestinationDetail'));
const Terms             = React.lazy(() => import('./pages/Terms'));
const Privacy           = React.lazy(() => import('./pages/Privacy'));
const Cookies           = React.lazy(() => import('./pages/Cookies'));
const Contact           = React.lazy(() => import('./pages/Contact'));
const Profile           = React.lazy(() => import('./pages/Profile'));
const MyBookings        = React.lazy(() => import('./pages/MyBookings'));
const BookingDetail     = React.lazy(() => import('./pages/BookingDetail'));
const SignIn            = React.lazy(() => import('./pages/SignIn'));
const SignUp            = React.lazy(() => import('./pages/SignUp'));
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'));
const NotFound          = React.lazy(() => import('./pages/NotFound'));
const FAQ               = React.lazy(() => import('./pages/FAQ'));

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
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 relative">
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold text-[#A56A43] tracking-[0.25em] mb-2 font-mono">[ LOADING ]</span>
        <div className="w-[80px] h-[1px] bg-[#D6D0C7] relative overflow-hidden">
          <div className="absolute top-0 bottom-0 w-1/2 bg-[#A56A43] animate-pulse" style={{ left: '25%' }} />
        </div>
      </div>
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
    connectSocket();
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
              <Route path="/cookies"            element={<Cookies />} />
              <Route path="/signin"             element={<SignIn />} />
              <Route path="/signup"             element={<SignUp />} />
              <Route path="/profile"            element={<Profile />} />
              <Route path="/my-bookings"        element={<MyBookings />} />
              <Route path="/my-bookings/:id"    element={<BookingDetail />} />
              <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
              <Route path="/faq"               element={<FAQ />} />
              <Route path="*"                   element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        {!hideChrome && <Footer />}
      </div>
      <CookiesPopup />
      <PromoPopup />
    </>
  );
}

function InitialLoader() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F4F1EA]"
    >
      {/* Subtle technical background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-[#D6D0C7]/40"></div>
        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-[#D6D0C7]/40"></div>
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#D6D0C7" strokeWidth="0.1" strokeDasharray="1 3" />
        </svg>
      </div>

      {/* Main Branding Composition */}
      <div className="relative flex flex-col items-center z-10">
        {/* Animated Bracket Tag */}
        <motion.span 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[9px] font-bold text-[#A56A43] tracking-[0.25em] mb-4 font-mono"
        >
          [ MODERN SELFDRIVE ]
        </motion.span>

        {/* Logo Text Reveal */}
        <div className="overflow-hidden mb-6">
          <motion.h1 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-5xl font-black tracking-[-0.05em] text-[#121212] uppercase font-display"
          >
            DRIVE
          </motion.h1>
        </div>

        {/* Minimal Progress Line */}
        <div className="w-[120px] h-[1px] bg-[#D6D0C7] relative overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-0 bottom-0 bg-[#A56A43]"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AnimatePresence mode="wait">
        {initialLoading && <InitialLoader key="loader" />}
      </AnimatePresence>
      <Router>
        <ErrorBoundary>
          <ScrollRestoration />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded focus:font-semibold focus:text-sm"
            style={{ background: '#121212', color: '#F4F1EA' }}
          >
            Skip to main content
          </a>
          <PublicShell />
        </ErrorBoundary>
      </Router>
    </GoogleOAuthProvider>
  );
}
