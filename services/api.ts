import { Trip, BookingStats, Testimonial, Booking, Enquiry, User, TeamMember, SiteSetting } from '../types';

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
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create trip');
        }
        const data = await response.json();
        return { ...data, id: data._id };
    },

    updateTrip: async (updatedTrip: Trip): Promise<Trip> => {
        const response = await fetch(`${API_URL}/trips/${updatedTrip.id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedTrip),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update trip');
        }
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

    // Get all trips including inactive (admin only)
    getAllTrips: async (): Promise<Trip[]> => {
        const response = await fetch(`${API_URL}/trips?all=true`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.map((trip: any) => ({ ...trip, id: trip._id }));
    },

    // Toggle trip active status (admin only)
    toggleTripStatus: async (id: string): Promise<{ isActive: boolean }> => {
        const response = await fetch(`${API_URL}/trips/${id}/toggle-status`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to toggle trip status');
        return await response.json();
    },

    // --- GALLERY ---
    getGalleryImages: async (): Promise<{ imageUrl: string; caption: string }[]> => {
        const response = await fetch(`${API_URL}/gallery`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    getAdminGallery: async (): Promise<{ id: string; imageUrl: string; caption: string; order: number; isActive: boolean }[]> => {
        const response = await fetch(`${API_URL}/gallery/admin`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch gallery');
        return await response.json();
    },

    addGalleryImage: async (imageUrl: string, caption?: string): Promise<{ id: string; imageUrl: string; caption: string; order: number; isActive: boolean }> => {
        const response = await fetch(`${API_URL}/gallery`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ imageUrl, caption: caption || '' })
        });
        if (!response.ok) throw new Error('Failed to add image');
        return await response.json();
    },

    updateGalleryImage: async (id: string, data: { caption?: string; order?: number; isActive?: boolean }): Promise<void> => {
        const response = await fetch(`${API_URL}/gallery/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update image');
    },

    deleteGalleryImage: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/gallery/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete image');
    },

    // --- MARQUEE (Ticker Tape) ---
    getMarqueeItems: async (): Promise<{ _id: string; text: string; icon: string }[]> => {
        const response = await fetch(`${API_URL}/marquee`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    },

    getAdminMarqueeItems: async (): Promise<{ _id: string; text: string; icon: string; isActive: boolean; order: number }[]> => {
        const response = await fetch(`${API_URL}/marquee/admin`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch marquee items');
        return await response.json();
    },

    addMarqueeItem: async (text: string, icon?: string): Promise<{ _id: string; text: string; icon: string; isActive: boolean; order: number }> => {
        const response = await fetch(`${API_URL}/marquee`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ text, icon: icon || 'Zap' })
        });
        if (!response.ok) throw new Error('Failed to add marquee item');
        return await response.json();
    },

    updateMarqueeItem: async (id: string, data: { text?: string; icon?: string; isActive?: boolean; order?: number }): Promise<void> => {
        const response = await fetch(`${API_URL}/marquee/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update marquee item');
    },

    toggleMarqueeItem: async (id: string): Promise<{ isActive: boolean }> => {
        const response = await fetch(`${API_URL}/marquee/${id}/toggle`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to toggle marquee item');
        return await response.json();
    },

    deleteMarqueeItem: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/marquee/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete marquee item');
    },

    // --- BOOKINGS ---

    createBooking: async (bookingData: Omit<Booking, 'id' | 'status' | 'bookedAt'>): Promise<Booking> => {
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData),
        });

        if (!response.ok) throw new Error("Booking failed");
        return await response.json();
    },

    getBookingsByUser: async (userId: string): Promise<Booking[]> => {
        const response = await fetch(`${API_URL}/bookings/user/${userId}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return await response.json();
    },

    getAllBookings: async (): Promise<Booking[]> => {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        return await response.json();
    },

    checkAvailability: async (tripId: string, date: string): Promise<{ totalBooked: number, totalMaleBooked: number, totalFemaleBooked: number, remaining: number, remainingMale: number, remainingFemale: number, maxCapacity: number, maxMaleCapacity: number, maxFemaleCapacity: number, isSoldOut: boolean }> => {
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

    updateBookingStatus: async (bookingId: string, status: 'pending' | 'contacted' | 'confirmed' | 'cancelled' | 'refunded' | 'failed' | 'expired'): Promise<Booking> => {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update booking status');
        return await response.json();
    },

    // --- SEAT MANAGEMENT (Admin) ---
    cleanupExpiredBookings: async (): Promise<{ success: boolean, expiredCount: number }> => {
        const response = await fetch(`${API_URL}/bookings/cleanup-expired`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to cleanup expired bookings');
        return await response.json();
    },

    getSeatStats: async (tripId: string, date: string): Promise<{
        confirmed: number,
        pending: number,
        maxCapacity: number,
        available: number,
        pendingBookings: Array<{
            id: string,
            customerName: string,
            email: string,
            travelers: number,
            createdAt: string,
            expiresAt: string
        }>
    }> => {
        const response = await fetch(`${API_URL}/bookings/seat-stats?tripId=${tripId}&date=${encodeURIComponent(date)}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to get seat stats');
        return await response.json();
    },

    forceReleaseBooking: async (bookingId: string): Promise<{ success: boolean, message: string }> => {
        const response = await fetch(`${API_URL}/bookings/${bookingId}/force-release`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to force release booking');
        return await response.json();
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
        const response = await fetch(`${API_URL}/stats`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch stats');
        return await response.json();
    },

    // --- TESTIMONIALS ---
    getTestimonials: async (): Promise<Testimonial[]> => {
        const response = await fetch(`${API_URL}/testimonials`);
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        return await response.json();
    },

    getAdminTestimonials: async (): Promise<Testimonial[]> => {
        const response = await fetch(`${API_URL}/testimonials/admin`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch testimonials');
        return await response.json();
    },

    addTestimonial: async (data: { name: string; location: string; quote: string; rating: number; avatarUrl: string }): Promise<Testimonial> => {
        const response = await fetch(`${API_URL}/testimonials`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add testimonial');
        return await response.json();
    },

    updateTestimonial: async (id: string, data: { name?: string; location?: string; quote?: string; rating?: number; avatarUrl?: string; isActive?: boolean }): Promise<Testimonial> => {
        const response = await fetch(`${API_URL}/testimonials/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update testimonial');
        return await response.json();
    },

    deleteTestimonial: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/testimonials/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete testimonial');
    },

    // --- ENQUIRIES ---
    submitEnquiry: async (enquiryData: { name: string, Travellers?: string, maleTravelers?: number, femaleTravelers?: number, phone: string, traveldate: string, email: string, where: string, message: string }): Promise<void> => {
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
    },

    // --- HERO CAROUSEL ---
    getHeroImages: async (): Promise<{ id: string; imageUrl: string; caption: string; order: number }[]> => {
        const response = await fetch(`${API_URL}/hero`);
        if (!response.ok) throw new Error('Failed to fetch hero images');
        return await response.json();
    },

    getAdminHeroImages: async (): Promise<{ id: string; imageUrl: string; caption: string; order: number; isActive: boolean }[]> => {
        const response = await fetch(`${API_URL}/hero/admin`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch hero images');
        return await response.json();
    },

    addHeroImage: async (imageUrl: string, caption?: string): Promise<{ id: string; imageUrl: string; caption: string; order: number; isActive: boolean }> => {
        const response = await fetch(`${API_URL}/hero`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ imageUrl, caption: caption || '' })
        });
        if (!response.ok) throw new Error('Failed to add hero image');
        return await response.json();
    },

    updateHeroImage: async (id: string, data: { caption?: string; order?: number; isActive?: boolean }): Promise<void> => {
        const response = await fetch(`${API_URL}/hero/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update hero image');
    },

    deleteHeroImage: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/hero/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete hero image');
    },

    // --- TEAM ---
    getTeamMembers: async (): Promise<TeamMember[]> => {
        const response = await fetch(`${API_URL}/team`);
        if (!response.ok) throw new Error('Failed to fetch team members');
        return await response.json();
    },

    getAdminTeamMembers: async (): Promise<TeamMember[]> => {
        const response = await fetch(`${API_URL}/team/admin`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch team members');
        return await response.json();
    },

    addTeamMember: async (data: Omit<TeamMember, '_id'>): Promise<TeamMember> => {
        const response = await fetch(`${API_URL}/team`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to add team member');
        return await response.json();
    },

    updateTeamMember: async (id: string, data: Partial<TeamMember>): Promise<TeamMember> => {
        const response = await fetch(`${API_URL}/team/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update team member');
        return await response.json();
    },

    deleteTeamMember: async (id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/team/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete team member');
    },

    // --- SITE SETTINGS ---
    getSetting: async (key: string): Promise<SiteSetting> => {
        const response = await fetch(`${API_URL}/settings/${key}`);
        if (!response.ok) {
            if (response.status === 404) return { key, value: null };
            throw new Error('Failed to fetch setting');
        }
        return await response.json();
    },

    updateSetting: async (key: string, data: { value: any, description?: string }): Promise<SiteSetting> => {
        const response = await fetch(`${API_URL}/settings/${key}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update setting');
        return await response.json();
    }
};