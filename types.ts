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
  email: string;
  reviewsCount: number;
  imageUrl: string; // Cover/Hero image (recommended: 1920x1080px, 16:9 ratio)
  cardImageUrl?: string; // Card/Thumbnail image (recommended: 800x600px, 4:3 ratio)
  gallery: string[];
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  pickupPoints: string[];
  itinerary: ItineraryItem[];
  dates: string[];
  maxCapacity?: number; // Legacy: Max travelers per date (default 12)
  maxMaleCapacity?: number;
  maxFemaleCapacity?: number;
  isActive?: boolean; // Trip visibility status (default true)
  gstPercentage?: number; // GST tax percentage applied at checkout (default 5)
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
  maleTravelers: number;
  femaleTravelers: number;
  pickupPoint?: string; // Selected boarding/pickup point for the trip
  totalPrice: number;
  status: 'pending' | 'contacted' | 'confirmed' | 'cancelled' | 'refunded' | 'failed' | 'expired';
  bookedAt: string;
}

export interface Enquiry {
  _id: string;
  id: string;
  name: string;
  email: string;
  when: number;
  where: string;
  maleTravelers: number;
  femaleTravelers: number;
  traveldate: Date;
  phone: string;
  message: string;
  status: 'new' | 'contacted' | 'resolved';
  createdAt: string;
}