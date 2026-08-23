import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const Admin = lazy(() => import('./pages/Admin'));
const Destinations = lazy(() => import('./pages/Destinations'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const OurStory = lazy(() => import('./pages/OurStory'));
const Team = lazy(() => import('./pages/Team'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const Terms = lazy(() => import('./pages/Terms'));
const CancellationPolicy = lazy(() => import('./pages/CancellationPolicy'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const Launch = lazy(() => import('./pages/Launch'));

// Simple loading spinner for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-cream">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-brand-olive/20 border-t-brand-olive rounded-full animate-spin mb-4"></div>
      <p className="text-brand-olive font-serif text-lg animate-pulse">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/trip/:id" element={<TripDetails />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/destinations" element={<Destinations />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/cancellation-policy" element={<CancellationPolicy />} />
              <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              <Route path="/launch" element={<Launch />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;