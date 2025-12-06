export interface ItineraryItem {
  day: number;
  title: string;
  activities: string[];
}

export interface Trip {
  id: string;
  slug?: string; // SEO friendly URL
  title: string;
  location: string;
  price: number;
  duration: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  gallery: string[];
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  pickupPoints: string[];
  itinerary: ItineraryItem[];
  dates: string[];
}

export interface BookingStats {
  month: string;
  bookings: number;
  revenue: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  quote: string;
  rating: number;
  avatarUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

export interface Booking {
  id: string;
  userId: string; // Linked to User
  tripId: string;
  tripTitle: string;
  tripImage: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  travelers: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded';
  bookedAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}