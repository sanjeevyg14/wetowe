import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, X, Users } from 'lucide-react';
import { Trip } from '../types';

// Demo first names for social proof
const DEMO_FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram',
  'Sneha', 'Arjun', 'Kavya', 'Aditya', 'Meera',
  'Rahul', 'Ishita', 'Karthik', 'Divya', 'Nikhil',
  'Pooja', 'Siddharth', 'Riya', 'Varun', 'Neha',
  'Amit', 'Tanvi', 'Harsh', 'Shruti', 'Dev',
  'Nisha', 'Manish', 'Sakshi', 'Raj', 'Simran'
];

// Demo last initials
const DEMO_LAST_INITIALS = ['S.', 'M.', 'K.', 'R.', 'P.', 'D.', 'V.', 'G.', 'T.', 'B.', 'N.', 'A.', 'J.', 'L.', 'C.'];

// Cities
const DEMO_CITIES = [
  'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Kochi', 'Chandigarh', 'Goa', 'Mysore', 'Indore'
];

interface BookingNotificationProps {
  trips: Trip[];
}

interface NotificationData {
  name: string;
  city: string;
  location: string;
  minutesAgo: number;
  travelers: number;
}

const BookingNotification: React.FC<BookingNotificationProps> = ({ trips }) => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const generateNotification = useCallback((): NotificationData | null => {
    if (trips.length === 0) return null;

    const trip = getRandomItem(trips);
    const firstName = getRandomItem(DEMO_FIRST_NAMES);
    const lastInitial = getRandomItem(DEMO_LAST_INITIALS);
    const city = getRandomItem(DEMO_CITIES);
    const minutesAgo = Math.floor(Math.random() * 45) + 2; // 2-47 mins ago
    const travelers = Math.floor(Math.random() * 4) + 1; // 1-4 travelers

    return {
      name: `${firstName} ${lastInitial}`,
      city,
      location: trip.location || trip.title,
      minutesAgo,
      travelers,
    };
  }, [trips]);

  useEffect(() => {
    if (trips.length === 0) return;

    // Show first notification after 8 seconds
    const initialTimeout = setTimeout(() => {
      if (!isDismissed) {
        const data = generateNotification();
        if (data) {
          setNotification(data);
          setIsVisible(true);
        }
      }
    }, 8000);

    return () => clearTimeout(initialTimeout);
  }, [trips, isDismissed, generateNotification]);

  useEffect(() => {
    if (!isVisible || !notification) return;

    // Auto-hide after 6 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => clearTimeout(hideTimeout);
  }, [isVisible, notification]);

  useEffect(() => {
    if (isVisible || isDismissed || trips.length === 0) return;

    // Schedule next notification 15-30 seconds after hide
    const nextDelay = Math.floor(Math.random() * 15000) + 15000;
    const nextTimeout = setTimeout(() => {
      const data = generateNotification();
      if (data) {
        setNotification(data);
        setIsVisible(true);
      }
    }, nextDelay);

    return () => clearTimeout(nextTimeout);
  }, [isVisible, isDismissed, trips, generateNotification]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!notification) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-50 max-w-sm transition-all duration-500 ease-out ${
        isVisible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : 'opacity-0 translate-y-4 -translate-x-4 pointer-events-none'
      }`}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl border border-brand-olive/10 overflow-hidden group">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-brand-cream via-brand-sage to-brand-cream"></div>

        <div className="p-4 pr-10">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-brand-cream to-brand-sage flex items-center justify-center text-white font-bold text-sm shadow-md">
              {notification.name.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-brand-black leading-snug">
                <span className="font-bold text-brand-black">{notification.name}</span>
                <span className="text-brand-black/60"> from {notification.city}</span>
              </p>
              <p className="text-sm text-brand-black/70 mt-0.5">
                booked a trip to{' '}
                <span className="font-bold text-brand-cream">{notification.location}</span>
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-sage bg-brand-sage/10 px-2 py-0.5 rounded-full">
                  <MapPin size={10} />
                  {notification.location}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-black/40">
                  <Users size={10} />
                  {notification.travelers} traveler{notification.travelers > 1 ? 's' : ''}
                </span>
              </div>

              {/* Timestamp */}
              <p className="text-[10px] text-brand-black/35 mt-1.5 font-bold uppercase tracking-wider">
                {notification.minutesAgo} min{notification.minutesAgo > 1 ? 's' : ''} ago
              </p>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-brand-black/30 hover:text-brand-black/60 hover:bg-gray-100 transition-all"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>

        {/* Subtle pulse dot */}
        <div className="absolute top-3.5 left-3.5">
          <span className="flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingNotification;
