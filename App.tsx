import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import Home from './pages/Home';
import TripDetails from './pages/TripDetails';
import Admin from './pages/Admin';
import Destinations from './pages/Destinations';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyBookings from './pages/MyBookings';
import OurStory from './pages/OurStory';
import Team from './pages/Team';
import ContactUs from './pages/ContactUs';
import Terms from './pages/Terms';
import CancellationPolicy from './pages/CancellationPolicy';
import BookingConfirmation from './pages/BookingConfirmation';
import Launch from './pages/Launch';
import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
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
          <Analytics />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;