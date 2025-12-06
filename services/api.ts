import { Trip, BookingStats, BlogPost, Testimonial, Booking, Enquiry, User } from '../types';
import { trips as seedTrips, adminStats, blogs as seedBlogs, testimonials as seedTestimonials, mockBookings, mockEnquiries } from './mockData';

// Use relative path to leverage Vite proxy or VITE_API_URL env var
// We use optional chaining (?.) to prevent crashing if import.meta.env is undefined
const API_URL = (import.meta as any)?.env?.VITE_API_URL || '/api'; 

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    } : { 
        'Content-Type': 'application/json' 
    };
};

export const api = {
  // --- TRIPS ---
  getTrips: async (): Promise<Trip[]> => {
    try {
        const response = await fetch(`${API_URL}/trips`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Convert _id to id
        return data.map((trip: any) => ({ ...trip, id: trip._id }));
    } catch (error) {
        console.warn("Using seed trips due to API error", error);
        return seedTrips;
    }
  },

  getTripById: async (id: string): Promise<Trip | undefined> => {
    try {
        const response = await fetch(`${API_URL}/trips/${id}`);
        if (!response.ok) throw new Error('Trip not found');
        const data = await response.json();
        return { ...data, id: data._id };
    } catch (error) {
        // Fallback: Check ID or Slug
        return seedTrips.find(t => t.id === id || t.slug === id);
    }
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

  // --- BOOKINGS ---
  
  createBooking: async (bookingData: Omit<Booking, 'id' | 'status' | 'bookedAt'>): Promise<Booking | { url: string }> => {
      try {
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
              // Return pending booking if no payment URL (fallback)
              return { ...bookingData, id: data.bookingId, status: 'pending', bookedAt: new Date().toISOString() } as Booking;
          }
          throw new Error("Booking failed");
      } catch (e) {
          console.error("Booking Error", e);
          throw e;
      }
  },

  getBookingsByUser: async (userId: string): Promise<Booking[]> => {
      try {
          const response = await fetch(`${API_URL}/bookings/user/${userId}`, {
              headers: getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch bookings');
          const data = await response.json();
          return data.map((b: any) => ({...b, id: b._id || b.transactionId })); // Normalize ID
      } catch (error) {
          console.warn(error);
          return mockBookings.filter(b => b.userId === userId);
      }
  },

  getAllBookings: async (): Promise<Booking[]> => {
      try {
          const response = await fetch(`${API_URL}/bookings`, {
              headers: getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch bookings');
          const data = await response.json();
          return data.map((b: any) => ({...b, id: b._id || b.transactionId }));
      } catch (error) {
           return mockBookings;
      }
  },

  checkAvailability: async (tripId: string, date: string): Promise<{ totalBooked: number, remaining: number, isSoldOut: boolean }> => {
      try {
          const response = await fetch(`${API_URL}/bookings/check-availability?tripId=${tripId}&date=${encodeURIComponent(date)}`);
          if (!response.ok) throw new Error('Failed to check availability');
          return await response.json();
      } catch (error) {
          // Fallback if backend route not ready
          return { totalBooked: 0, remaining: 12, isSoldOut: false }; 
      }
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
    try {
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) return data;
        return adminStats;
    } catch {
        return adminStats;
    }
  },

  // --- BLOGS ---

  getBlogs: async (): Promise<BlogPost[]> => {
    try {
        const response = await fetch(`${API_URL}/blogs`);
        const data = await response.json();
        if (data.length === 0) return seedBlogs.filter(b => b.status === 'approved');
        return data.map((b: any) => ({...b, id: b._id}));
    } catch {
        return seedBlogs.filter(b => b.status === 'approved');
    }
  },

  getAllBlogs: async (): Promise<BlogPost[]> => {
    try {
        const response = await fetch(`${API_URL}/blogs/all`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        if (data.length === 0) return seedBlogs;
        return data.map((b: any) => ({...b, id: b._id}));
    } catch {
        return seedBlogs;
    }
  },

  getBlogById: async (id: string): Promise<BlogPost | undefined> => {
    try {
        const response = await fetch(`${API_URL}/blogs/${id}`);
        if (!response.ok) throw new Error("Blog not found");
        const data = await response.json();
        return { ...data, id: data._id };
    } catch {
        return seedBlogs.find(b => b.id === id);
    }
  },
  
  createBlog: async (blogData: Omit<BlogPost, 'id' | 'date' | 'status'>): Promise<BlogPost> => {
    const blogPayload = {
        ...blogData,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending'
    };
    
    const response = await fetch(`${API_URL}/blogs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogPayload),
    });
    if (!response.ok) throw new Error('Failed to create blog');
    const data = await response.json();
    return { ...data, id: data._id };
  },
  
  updateBlogStatus: async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
      const response = await fetch(`${API_URL}/blogs/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update blog status');
  },

  getTestimonials: async (): Promise<Testimonial[]> => {
    try {
        const response = await fetch(`${API_URL}/testimonials`);
        const data = await response.json();
        if (data.length === 0) return seedTestimonials;
        return data.map((t: any) => ({...t, id: t._id}));
    } catch {
        return seedTestimonials;
    }
  },

  // --- ENQUIRIES ---
  submitEnquiry: async (enquiryData: { name: string, email: string, phone: string, message: string }): Promise<void> => {
    const response = await fetch(`${API_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryData),
    });
    if (!response.ok) throw new Error('Failed to submit enquiry');
  },

  getEnquiries: async (): Promise<Enquiry[]> => {
    try {
        const response = await fetch(`${API_URL}/enquiries`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch enquiries');
        const data = await response.json();
        return data.map((e: any) => ({ ...e, id: e._id }));
    } catch (error) {
        console.error(error);
        return mockEnquiries;
    }
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