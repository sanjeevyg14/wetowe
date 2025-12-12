import { Trip, BookingStats, Testimonial, Booking, Enquiry, User } from '../types';

const API_URL = (import.meta as any)?.env?.VITE_API_URL || '/api'; 

const getAuthHeaders = (): HeadersInit => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const token = localStorage.getItem('token');
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
};

const getFileUploadHeaders = (): HeadersInit => {
    const headers = new Headers();
    const token = localStorage.getItem('token');
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
};

export const api = {
  // --- UPLOAD ---
  uploadImage: async (imageFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: getFileUploadHeaders(),
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Image upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
  },
  
  // --- TRIPS ---
  getTrips: async (): Promise<Trip[]> => {
    const response = await fetch(`${API_URL}/trips`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data.map((trip: any) => ({ ...trip, id: trip._id }));
  },

  getTripById: async (id: string): Promise<Trip | undefined> => {
    const response = await fetch(`${API_URL}/trips/${id}`);
    if (!response.ok) throw new Error('Trip not found');
    const data = await response.json();
    return { ...data, id: data._id };
  },

  createTrip: async (trip: Trip): Promise<Trip> => {
    const response = await fetch(`${API_URL}/trips`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(trip),
    });
    if (!response.ok) throw new Error('Failed to create trip');
    const data = await response.json();
    return { ...data, id: data._id };
  },

  updateTrip: async (updatedTrip: Trip): Promise<Trip> => {
    const response = await fetch(`${API_URL}/trips/${updatedTrip.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedTrip),
    });
    if (!response.ok) throw new Error('Failed to update trip');
    const data = await response.json();
    return { ...data, id: data._id };
  },

  deleteTrip: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/trips/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete trip');
  },

  // --- GALLERY ---
  getGalleryImages: async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/gallery`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  },

  // --- BOOKINGS ---
  
  createBooking: async (bookingData: Omit<Booking, 'id' | 'status' | 'bookedAt'>): Promise<Booking | { url: string }> => {
      const response = await fetch(`${API_URL}/payment/initiate`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(bookingData),
      });

      if (response.ok) {
          const data = await response.json();
          if (data.success && data.url) {
              return { url: data.url }; 
          }
          return { ...bookingData, id: data.bookingId, status: 'pending', bookedAt: new Date().toISOString() } as Booking;
      }
      throw new Error("Booking failed");
  },

  getBookingsByUser: async (userId: string): Promise<Booking[]> => {
      const response = await fetch(`${API_URL}/bookings/user/${userId}`, {
          headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      return data.map((b: any) => ({...b, id: b._id || b.transactionId }));
  },

  getAllBookings: async (): Promise<Booking[]> => {
      const response = await fetch(`${API_URL}/bookings`, {
          headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      return data.map((b: any) => ({...b, id: b._id || b.transactionId }));
  },

  checkAvailability: async (tripId: string, date: string): Promise<{ totalBooked: number, remaining: number, isSoldOut: boolean }> => {
      const response = await fetch(`${API_URL}/bookings/check-availability?tripId=${tripId}&date=${encodeURIComponent(date)}`);
      if (!response.ok) throw new Error('Failed to check availability');
      return await response.json();
  },

  cancelBooking: async (bookingId: string): Promise<void> => {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, { 
          method: 'PUT',
          headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to cancel booking');
  },

  processRefund: async (bookingId: string): Promise<void> => {
      const response = await fetch(`${API_URL}/bookings/${bookingId}/refund`, { 
          method: 'PUT',
          headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error('Failed to process refund');
  },

  // --- USER PROFILE ---
  updateProfile: async (userData: Partial<User>): Promise<User> => {
      const response = await fetch(`${API_URL}/auth/profile`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return await response.json();
  },

  // --- STATS ---
  getStats: async (): Promise<BookingStats[]> => {
    const response = await fetch(`${API_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    const response = await fetch(`${API_URL}/testimonials`);
    if (!response.ok) throw new Error('Failed to fetch testimonials');
    const data = await response.json();
    return data.map((t: any) => ({...t, id: t._id}));
  },

  // --- ENQUIRIES ---
  submitEnquiry: async (enquiryData: { name: string, Travellers: string, phone: string, traveldate: string, where: string, message: string }): Promise<void> => {
    const response = await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData),
    });
    if (!response.ok) throw new Error('Failed to submit enquiry');
  },

  getEnquiries: async (): Promise<Enquiry[]> => {
    const response = await fetch(`${API_URL}/enquiries`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch enquiries');
    const data = await response.json();
    return data.map((e: any) => ({ ...e, id: e._id }));
  },

  updateEnquiryStatus: async (id: string, status: 'contacted' | 'resolved'): Promise<void> => {
    const response = await fetch(`${API_URL}/enquiries/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update enquiry status');
  }
};