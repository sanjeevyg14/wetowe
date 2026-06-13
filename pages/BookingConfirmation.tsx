import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Booking } from '../types';

type LocationState = {
  booking?: Booking;
  tripTitle?: string;
};

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const booking = state.booking;

  return (
    <div className="min-h-screen bg-brand-beige flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg border border-brand-beige p-8 md:p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-6">
            <CheckCircle2 size={42} />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-black mb-3">Thank you for your enquiry!</h1>
          <p className="text-brand-black/70 leading-relaxed">
            Your booking details are received. We have emailed your confirmation and our team will contact you soon for manual booking confirmation.
          </p>

          {booking && (
            <div className="mt-8 text-left bg-brand-olive/5 border border-brand-olive/10 rounded-xl p-5">
              <p className="text-xs uppercase tracking-wider text-brand-black/50 font-bold mb-2">Booking Reference</p>
              <p className="text-lg font-mono font-bold text-brand-black mb-4">#{booking.id.slice(-6).toUpperCase()}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-brand-black/80">
                <p><span className="font-semibold">Trip:</span> {booking.tripTitle || state.tripTitle}</p>
                <p><span className="font-semibold">Date:</span> {booking.date}</p>
                <p><span className="font-semibold">Travelers:</span> {booking.travelers}</p>
                <p><span className="font-semibold">Status:</span> {booking.status}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/my-bookings" className="inline-flex items-center justify-center gap-2 bg-brand-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-cream transition">
              View My Bookings <ArrowRight size={16} />
            </Link>
            <Link to="/destinations" className="inline-flex items-center justify-center gap-2 border border-brand-black/20 text-brand-black px-6 py-3 rounded-lg font-semibold hover:bg-brand-beige transition">
              Explore More Trips
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingConfirmation;
