import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LayoutDashboard, Package, Users, DollarSign, PlusCircle, Settings, Edit, Trash2, X, Save, Search, CheckCircle, RefreshCcw, MessageSquare, Mail, Phone, Plus, Minus, ChevronDown, ChevronUp, Link as LinkIcon, Upload, Image as ImageIcon, Loader, Star, ToggleLeft, ToggleRight, Megaphone, FileDown, FileText } from 'lucide-react';
import { downloadTicketPDF, downloadManifestPDF } from '../utils/pdfUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/uploadService';
import { Trip, BookingStats, Booking, Enquiry, ItineraryItem, Testimonial } from '../types';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { TeamMember, SiteSetting } from '../types';

// -- Helper Components for List Management --

const ArrayInput: React.FC<{
    label: string;
    items: string[];
    onChange: (newItems: string[]) => void;
    placeholder?: string;
}> = ({ label, items, onChange, placeholder }) => {
    const [newItem, setNewItem] = useState('');

    const add = () => {
        if (newItem.trim()) {
            onChange([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const remove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none text-sm"
                    placeholder={placeholder || `Add ${label.toLowerCase()}...`}
                />
                <button type="button" onClick={add} className="bg-brand-purple text-white p-2 rounded-lg hover:bg-brand-darkPurple"><Plus size={18} /></button>
            </div>
            <ul className="space-y-1 max-h-40 overflow-y-auto">
                {items.map((item, i) => (
                    <li key={i} className="flex justify-between items-center bg-gray-50 px-3 py-1.5 rounded text-sm border border-gray-100">
                        <span className="text-gray-900 font-medium">{item}</span>
                        <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ItineraryInput: React.FC<{
    itinerary: ItineraryItem[];
    onChange: (newItinerary: ItineraryItem[]) => void;
}> = ({ itinerary, onChange }) => {
    const addDay = () => {
        onChange([...itinerary, { day: itinerary.length + 1, title: '', activities: [] }]);
    };

    const updateDay = (index: number, field: keyof ItineraryItem, value: any) => {
        const updated = [...itinerary];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeDay = (index: number) => {
        onChange(itinerary.filter((_, i) => i !== index));
    };

    const addActivity = (dayIndex: number, activity: string) => {
        if (!activity.trim()) return;
        const updated = [...itinerary];
        updated[dayIndex].activities.push(activity);
        onChange(updated);
    };

    const removeActivity = (dayIndex: number, actIndex: number) => {
        const updated = [...itinerary];
        updated[dayIndex].activities.splice(actIndex, 1);
        onChange(updated);
    };

    return (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-gray-700">Detailed Itinerary</label>
                <button type="button" onClick={addDay} className="text-sm text-brand-purple font-bold flex items-center gap-1 hover:underline"><Plus size={14} /> Add Day</button>
            </div>
            {itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="bg-white p-4 rounded border border-gray-200 shadow-sm relative group">
                    <button type="button" onClick={() => removeDay(dayIndex)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-3">
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Day</label>
                            <input type="number" value={day.day} onChange={e => updateDay(dayIndex, 'day', parseInt(e.target.value))} className="w-full border rounded px-2 py-1 text-sm font-bold" />
                        </div>
                        <div className="md:col-span-10">
                            <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                            <input type="text" value={day.title} onChange={e => updateDay(dayIndex, 'title', e.target.value)} className="w-full border rounded px-2 py-1 text-sm" placeholder="e.g. Arrival & Sightseeing" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Activities</label>
                        <ul className="pl-4 list-disc text-sm text-gray-600 mb-2 space-y-1">
                            {day.activities.map((act, actIndex) => (
                                <li key={actIndex} className="group/act relative pr-6">
                                    {act}
                                    <button type="button" onClick={() => removeActivity(dayIndex, actIndex)} className="absolute right-0 top-0 text-red-300 hover:text-red-500 hidden group-hover/act:block"><X size={12} /></button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id={`act-input-${dayIndex}`}
                                placeholder="Add activity..."
                                className="flex-1 border rounded px-2 py-1 text-sm"
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addActivity(dayIndex, e.currentTarget.value);
                                        e.currentTarget.value = '';
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById(`act-input-${dayIndex}`) as HTMLInputElement;
                                    addActivity(dayIndex, el.value);
                                    el.value = '';
                                }}
                                className="bg-brand-purple text-white px-3 py-1 rounded text-sm hover:bg-brand-darkPurple"
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// -- Main Component --

const Admin: React.FC = () => {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [stats, setStats] = useState<BookingStats[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [galleryImages, setGalleryImages] = useState<{ id: string; imageUrl: string; caption: string; order: number; isActive: boolean }[]>([]);
    const [reviews, setReviews] = useState<Testimonial[]>([]);
    const [tickerItems, setTickerItems] = useState<{ _id: string; text: string; icon: string; isActive: boolean; order: number }[]>([]);
    const [heroImages, setHeroImages] = useState<{ id: string; imageUrl: string; caption: string; order: number; isActive: boolean }[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [siteSettings, setSiteSettings] = useState<SiteSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'bookings' | 'enquiries' | 'gallery' | 'reviews' | 'ticker' | 'hero' | 'team' | 'settings'>('overview');
    const { user, isAdmin, loading: authLoading } = useAuth();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTrip, setCurrentTrip] = useState<Partial<Trip>>({});
    const [isUploading, setIsUploading] = useState(false);

    // Enquiry Modal State
    const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

    // Team Modal State
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [currentTeamMember, setCurrentTeamMember] = useState<Partial<TeamMember>>({});

    // Refs for file inputs
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const cardImageInputRef = useRef<HTMLInputElement>(null);
    const galleryImageInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const results = await Promise.allSettled([
                api.getAllTrips(),
                api.getStats(),
                api.getAllBookings(),
                api.getEnquiries(),
                api.getAdminGallery(),
                api.getAdminTestimonials(),
                api.getAdminMarqueeItems(),
                api.getAdminHeroImages(),
                api.getAdminTeamMembers(),
                Promise.all([
                    api.getSetting('home_stats'),
                    api.getSetting('home_quick_tags'),
                    api.getSetting('our_story_content'),
                    api.getSetting('contact_us_content')
                ])
            ]);

            if (results[0].status === 'fulfilled') setTrips(results[0].value);
            else console.error("Failed to fetch trips:", results[0].reason);

            if (results[1].status === 'fulfilled') setStats(results[1].value);
            else console.error("Failed to fetch stats:", results[1].reason);

            if (results[2].status === 'fulfilled') setAllBookings(results[2].value);
            else console.error("Failed to fetch bookings:", results[2].reason);

            if (results[3].status === 'fulfilled') setEnquiries(results[3].value);
            else console.error("Failed to fetch enquiries:", results[3].reason);

            if (results[4].status === 'fulfilled') setGalleryImages(results[4].value);
            else console.error("Failed to fetch gallery:", results[4].reason);

            if (results[5].status === 'fulfilled') setReviews(results[5].value);
            else console.error("Failed to fetch reviews:", results[5].reason);

            if (results[6].status === 'fulfilled') setTickerItems(results[6].value);
            else console.error("Failed to fetch ticker items:", results[6].reason);

            if (results[7].status === 'fulfilled') setHeroImages(results[7].value);
            else console.error("Failed to fetch hero images:", results[7].reason);

            if (results[8].status === 'fulfilled') setTeamMembers(results[8].value);
            else console.error("Failed to fetch team members:", results[8].reason);

            if (results[9].status === 'fulfilled') setSiteSettings(results[9].value.filter(Boolean));
            else console.error("Failed to fetch settings:", results[9].reason);

        } catch (error) {
            console.error("Failed to fetch admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this trip?')) {
            await api.deleteTrip(id);
            setTrips(trips.filter(t => t.id !== id));
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            const result = await api.toggleTripStatus(id);
            // Update local state
            setTrips(trips.map(t => t.id === id ? { ...t, isActive: result.isActive } : t));
        } catch (error) {
            console.error('Failed to toggle trip status:', error);
            alert('Failed to toggle trip status');
        }
    };

    const handleBookingStatusUpdate = async (bookingId: string, status: 'pending' | 'contacted' | 'confirmed' | 'cancelled' | 'refunded' | 'failed' | 'expired') => {
        try {
            const updated = await api.updateBookingStatus(bookingId, status);
            setAllBookings(allBookings.map(b => b.id === bookingId ? updated : b));
        } catch (error) {
            console.error('Failed to update booking status:', error);
            alert('Failed to update booking status. Please try again.');
        }
    };

    // Bookings grouped by trip → date for the admin bookings tab
    const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

    const bookingsByTrip = useMemo(() => {
        const grouped: Record<string, { tripTitle: string; byDate: Record<string, Booking[]> }> = {};
        allBookings.forEach(b => {
            if (!grouped[b.tripId]) grouped[b.tripId] = { tripTitle: b.tripTitle || b.tripId, byDate: {} };
            const dateKey = b.date || 'No Date';
            if (!grouped[b.tripId].byDate[dateKey]) grouped[b.tripId].byDate[dateKey] = [];
            grouped[b.tripId].byDate[dateKey].push(b);
        });
        return grouped;
    }, [allBookings]);

    const toggleTrip = (tripId: string) => {
        setExpandedTrips(prev => {
            const next = new Set(prev);
            if (next.has(tripId)) next.delete(tripId);
            else next.add(tripId);
            return next;
        });
    };

    const toggleDate = (key: string) => {
        setExpandedDates(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleEnquiryStatus = async (id: string, status: 'contacted') => {
        await api.updateEnquiryStatus(id, status);
        setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e));
    };

    // Gallery Management Handlers
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [newGalleryCaption, setNewGalleryCaption] = useState('');
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setGalleryUploading(true);
            try {
                const file = e.target.files[0];
                const imageUrl = await uploadToCloudinary(file);
                const newImage = await api.addGalleryImage(imageUrl, newGalleryCaption);
                setGalleryImages([...galleryImages, newImage]);
                setNewGalleryCaption('');
                if (galleryInputRef.current) galleryInputRef.current.value = '';
            } catch (error) {
                console.error('Gallery upload failed:', error);
                alert('Failed to upload gallery image');
            } finally {
                setGalleryUploading(false);
            }
        }
    };

    const handleDeleteGalleryImage = async (id: string) => {
        if (confirm('Are you sure you want to delete this gallery image?')) {
            try {
                await api.deleteGalleryImage(id);
                setGalleryImages(galleryImages.filter(img => img.id !== id));
            } catch (error) {
                console.error('Delete gallery image failed:', error);
                alert('Failed to delete gallery image');
            }
        }
    };

    // Hero Carousel Management Handlers
    const [heroUploading, setHeroUploading] = useState(false);
    const [newHeroCaption, setNewHeroCaption] = useState('');
    const heroInputRef = useRef<HTMLInputElement>(null);

    const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setHeroUploading(true);
            try {
                const file = e.target.files[0];
                const imageUrl = await uploadToCloudinary(file);
                const newImage = await api.addHeroImage(imageUrl, newHeroCaption);
                setHeroImages([...heroImages, newImage]);
                setNewHeroCaption('');
                if (heroInputRef.current) heroInputRef.current.value = '';
            } catch (error) {
                console.error('Hero image upload failed:', error);
                alert('Failed to upload hero image');
            } finally {
                setHeroUploading(false);
            }
        }
    };

    const handleDeleteHeroImage = async (id: string) => {
        if (confirm('Are you sure you want to delete this hero image?')) {
            try {
                await api.deleteHeroImage(id);
                setHeroImages(heroImages.filter(img => img.id !== id));
            } catch (error) {
                console.error('Delete hero image failed:', error);
                alert('Failed to delete hero image');
            }
        }
    };

    const handleToggleHeroImage = async (id: string, isActive: boolean) => {
        try {
            await api.updateHeroImage(id, { isActive });
            setHeroImages(heroImages.map(img => img.id === id ? { ...img, isActive } : img));
        } catch (error) {
            console.error('Failed to toggle hero image:', error);
            alert('Failed to update hero image');
        }
    };

    // Reviews Management Handlers
    const [reviewUploading, setReviewUploading] = useState(false);
    const [newReview, setNewReview] = useState({ name: '', location: '', quote: '', rating: 5, avatarUrl: '' });
    const [reviewAvatarUploading, setReviewAvatarUploading] = useState(false);
    const reviewAvatarInputRef = useRef<HTMLInputElement>(null);

    const handleReviewAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setReviewAvatarUploading(true);
            try {
                const file = e.target.files[0];
                const imageUrl = await uploadToCloudinary(file);
                setNewReview({ ...newReview, avatarUrl: imageUrl });
            } catch (error) {
                console.error('Avatar upload failed:', error);
                alert('Failed to upload avatar');
            } finally {
                setReviewAvatarUploading(false);
            }
        }
    };

    const handleAddReview = async () => {
        if (!newReview.name || !newReview.quote || !newReview.location || !newReview.avatarUrl) {
            alert('Please fill all required fields and upload an avatar');
            return;
        }
        setReviewUploading(true);
        try {
            const createdReview = await api.addTestimonial(newReview);
            setReviews([createdReview, ...reviews]);
            setNewReview({ name: '', location: '', quote: '', rating: 5, avatarUrl: '' });
            if (reviewAvatarInputRef.current) reviewAvatarInputRef.current.value = '';
        } catch (error) {
            console.error('Add review failed:', error);
            alert('Failed to add review');
        } finally {
            setReviewUploading(false);
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (confirm('Are you sure you want to delete this review?')) {
            try {
                await api.deleteTestimonial(id);
                setReviews(reviews.filter(r => r.id !== id));
            } catch (error) {
                console.error('Delete review failed:', error);
                alert('Failed to delete review');
            }
        }
    };

    const openAddModal = () => {
        setCurrentTrip({
            title: '',
            category: 'Trending Expeditions',
            slug: '',
            location: '',
            price: 0,
            duration: '',
            rating: 5.0,
            reviewsCount: 0,
            imageUrl: '',
            cardImageUrl: '',
            description: '',
            gallery: [],
            highlights: [],
            inclusions: [],
            exclusions: [],
            pickupPoints: [],
            itinerary: [],
            dates: [],
            maxMaleCapacity: 6,
            maxFemaleCapacity: 6,
            gstPercentage: 5
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const openEditModal = (trip: Trip) => {
        setCurrentTrip({
            ...trip,
            category: trip.category || 'Trending Expeditions',
            gallery: trip.gallery || [],
            highlights: trip.highlights || [],
            inclusions: trip.inclusions || [],
            exclusions: trip.exclusions || [],
            pickupPoints: trip.pickupPoints || [],
            itinerary: trip.itinerary || [],
            dates: trip.dates || []
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTrip.title || !currentTrip.price) return;

        try {
            if (isEditing && currentTrip.id) {
                await api.updateTrip(currentTrip as Trip);
                setTrips(trips.map(t => t.id === currentTrip.id ? (currentTrip as Trip) : t));
            } else {
                const newTrip = await api.createTrip(currentTrip as Trip);
                setTrips([newTrip, ...trips]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save trip", error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setCurrentTrip(prev => {
            const newData = {
                ...prev,
                [name]: name === 'price' || name === 'rating' || name === 'reviewsCount' || name === 'gstPercentage' ? Number(value) : value
            };

            if (name === 'title' && !isEditing) {
                newData.slug = value.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
            }

            return newData;
        });
    };

    const updateArrayField = (field: keyof Trip, newItems: any[]) => {
        setCurrentTrip(prev => ({ ...prev, [field]: newItems }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'card' | 'gallery') => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const url = await uploadToCloudinary(e.target.files[0]);

                if (target === 'main') {
                    setCurrentTrip(prev => ({ ...prev, imageUrl: url }));
                } else if (target === 'card') {
                    setCurrentTrip(prev => ({ ...prev, cardImageUrl: url }));
                } else {
                    setCurrentTrip(prev => ({
                        ...prev,
                        gallery: [...(prev.gallery || []), url]
                    }));
                }
            } catch (error: any) {
                alert(error.message);
            } finally {
                setIsUploading(false);
                // Reset input
                e.target.value = '';
            }
        }
    };

    // Ticker state for new item form
    const [newTickerText, setNewTickerText] = useState('');
    const [newTickerIcon, setNewTickerIcon] = useState('Zap');

    const iconOptions = ['Zap', 'ArrowUpRight', 'MapPin', 'Star', 'Gift', 'Percent', 'Tag', 'Clock', 'Heart', 'Flame'];

    const handleAddTicker = async () => {
        if (!newTickerText.trim()) return;
        try {
            const newItem = await api.addMarqueeItem(newTickerText.trim(), newTickerIcon);
            setTickerItems([...tickerItems, newItem]);
            setNewTickerText('');
            setNewTickerIcon('Zap');
        } catch (error) {
            console.error('Failed to add ticker item:', error);
            alert('Failed to add ticker item');
        }
    };

    const handleToggleTicker = async (id: string) => {
        try {
            const result = await api.toggleMarqueeItem(id);
            setTickerItems(tickerItems.map(item =>
                item._id === id ? { ...item, isActive: result.isActive } : item
            ));
        } catch (error) {
            console.error('Failed to toggle ticker item:', error);
            alert('Failed to toggle ticker item');
        }
    };

    const handleDeleteTicker = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ticker item?')) return;
        try {
            await api.deleteMarqueeItem(id);
            setTickerItems(tickerItems.filter(item => item._id !== id));
        } catch (error) {
            console.error('Failed to delete ticker item:', error);
            alert('Failed to delete ticker item');
        }
    };

    // --- Team Member Handlers ---
    const handleAddTeam = () => {
        setCurrentTeamMember({
            name: '',
            role: '',
            imageUrl: '',
            bio: '',
            linkedin: '',
            instagram: '',
            order: 0,
            isActive: true
        });
        setIsEditingTeam(false);
        setIsTeamModalOpen(true);
    };

    const handleEditTeam = (member: TeamMember) => {
        setCurrentTeamMember(member);
        setIsEditingTeam(true);
        setIsTeamModalOpen(true);
    };

    const handleDeleteTeam = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;
        try {
            await api.deleteTeamMember(id);
            setTeamMembers(teamMembers.filter(m => m._id !== id));
        } catch (error) {
            console.error('Failed to delete team member', error);
            alert('Failed to delete team member');
        }
    };

    const handleTeamSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentTeamMember.imageUrl) {
            alert('Please upload a photo for the team member.');
            return;
        }
        try {
            if (isEditingTeam && currentTeamMember._id) {
                const updated = await api.updateTeamMember(currentTeamMember._id, currentTeamMember as TeamMember);
                setTeamMembers(teamMembers.map(m => m._id === updated._id ? updated : m));
            } else {
                const added = await api.addTeamMember(currentTeamMember as Omit<TeamMember, '_id'>);
                setTeamMembers([added, ...teamMembers]);
            }
            setIsTeamModalOpen(false);
        } catch (error) {
            console.error('Failed to save team member', error);
            alert('Failed to save team member');
        }
    };

    if (authLoading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login?redirect=/admin" />;
    if (!isAdmin) return <Navigate to="/" />;

    return (
        <div className="min-h-screen bg-gray-100 font-sans admin-panel">
            <Navbar />

            <div className="flex max-w-7xl mx-auto px-4 py-8 gap-6">
                {/* Sidebar */}
                <aside className="w-64 hidden lg:block">
                    <div className="bg-white rounded-xl shadow-sm p-4 h-[calc(100vh-150px)] sticky top-24">
                        <div className="mb-8 px-2">
                            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
                        </div>
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'overview' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <LayoutDashboard size={20} /> Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('trips')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'trips' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Package size={20} /> Trips & Packages
                            </button>
                            <button
                                onClick={() => setActiveTab('bookings')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'bookings' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Users size={20} /> Booking Enquiries
                            </button>
                            <button
                                onClick={() => setActiveTab('enquiries')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'enquiries' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <MessageSquare size={20} /> Enquiries
                                {enquiries.filter(e => e.status === 'new').length > 0 && (
                                    <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5 ml-auto">
                                        {enquiries.filter(e => e.status === 'new').length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('gallery')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'gallery' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <ImageIcon size={20} /> Gallery
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'reviews' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Star size={20} /> Reviews
                            </button>
                            <button
                                onClick={() => setActiveTab('ticker')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'ticker' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Megaphone size={20} /> Ticker
                            </button>
                            <button
                                onClick={() => setActiveTab('hero')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'hero' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <ImageIcon size={20} /> Hero Carousel
                            </button>
                            <button
                                onClick={() => setActiveTab('team')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'team' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Users size={20} /> Team Members
                            </button>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium transition ${activeTab === 'settings' ? 'bg-purple-50 text-brand-purple' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Settings size={20} /> Site Settings
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Mobile Tab Navigation */}
                <div className="lg:hidden w-full mb-4 overflow-x-auto">
                    <div className="flex gap-2 min-w-max px-1 pb-2">
                        {(['overview', 'trips', 'bookings', 'enquiries', 'gallery', 'reviews', 'ticker', 'hero', 'team', 'settings'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition ${activeTab === tab
                                    ? 'bg-brand-purple text-white'
                                    : 'bg-white text-gray-600 border border-gray-200'
                                    }`}
                            >
                                {tab === 'overview' && <LayoutDashboard size={16} />}
                                {tab === 'trips' && <Package size={16} />}
                                {tab === 'bookings' && <Users size={16} />}
                                {tab === 'enquiries' && <MessageSquare size={16} />}
                                {tab === 'gallery' && <ImageIcon size={16} />}
                                {tab === 'reviews' && <Star size={16} />}
                                {tab === 'ticker' && <Megaphone size={16} />}
                                {tab === 'hero' && <ImageIcon size={16} />}
                                {tab === 'bookings' ? 'Booking Enquiries' : tab === 'hero' ? 'Hero Carousel' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab === 'bookings' ? 'Booking Enquiries' : activeTab}</h1>
                        {activeTab === 'trips' && (
                            <button
                                onClick={openAddModal}
                                className="bg-brand-purple text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-darkPurple flex items-center gap-2 transition"
                            >
                                <PlusCircle size={18} /> Add New Trip
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
                        </div>
                    ) : (
                        <>
                            {/* ... (Overview, Bookings, Enquiries Tabs remain unchanged) ... */}
                            {activeTab === 'overview' && (
                                <>
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                                                <DollarSign className="text-green-500" size={20} />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₹{allBookings
                                                    .filter(b => b.status === 'confirmed')
                                                    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)
                                                    .toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">From confirmed bookings</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
                                                <Users className="text-blue-500" size={20} />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">{allBookings.length}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {allBookings.filter(b => b.status === 'confirmed').length} confirmed
                                            </p>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-gray-500 text-sm font-medium">Active Trips</h3>
                                                <Package className="text-purple-500" size={20} />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {trips.filter(t => t.isActive !== false).length}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {trips.filter(t => t.isActive === false).length} inactive
                                            </p>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-gray-500 text-sm font-medium">New Enquiries</h3>
                                                <MessageSquare className="text-orange-500" size={20} />
                                            </div>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {enquiries.filter(e => e.status === 'new').length}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {enquiries.length} total enquiries
                                            </p>
                                        </div>
                                    </div>

                                    {/* Booking Analytics Chart */}
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">Booking Analytics</h3>
                                        <p className="text-sm text-gray-500 mb-6">Last 6 months booking trends</p>
                                        <div className="h-80 w-full">
                                            {stats.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={stats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                                                        <Tooltip
                                                            cursor={{ fill: '#f9fafb' }}
                                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            formatter={(value: number, name: string) => [
                                                                name === 'revenue' ? `₹${value.toLocaleString()}` : value,
                                                                name === 'revenue' ? 'Revenue' : 'Bookings'
                                                            ]}
                                                        />
                                                        <Bar dataKey="bookings" fill="#6f3289" radius={[4, 4, 0, 0]} barSize={40} name="Bookings" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                    <LayoutDashboard size={48} className="mb-4 opacity-50" />
                                                    <p>No booking data available yet</p>
                                                    <p className="text-sm mt-1">Bookings will appear here once customers start booking</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quick Stats Summary */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Recent Bookings */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Bookings</h3>
                                            {allBookings.length > 0 ? (
                                                <div className="space-y-3">
                                                    {allBookings.slice(0, 5).map((booking) => (
                                                        <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                            <div>
                                                                <p className="font-medium text-gray-800 text-sm">{booking.customerName}</p>
                                                                <p className="text-xs text-gray-500">{booking.tripTitle}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-gray-900 text-sm">₹{booking.totalPrice?.toLocaleString()}</p>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-gray-100 text-gray-600'
                                                                    }`}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 text-center py-8">No bookings yet</p>
                                            )}
                                        </div>

                                        {/* Recent Enquiries */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Enquiries</h3>
                                            {enquiries.length > 0 ? (
                                                <div className="space-y-3">
                                                    {enquiries.slice(0, 5).map((enquiry) => (
                                                        <div key={enquiry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                            <div>
                                                                <p className="font-medium text-gray-800 text-sm">{enquiry.name}</p>
                                                                <p className="text-xs text-gray-500">{enquiry.where || 'General enquiry'}</p>
                                                            </div>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${enquiry.status === 'new' ? 'bg-orange-100 text-orange-700' :
                                                                enquiry.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                {enquiry.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-400 text-center py-8">No enquiries yet</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'bookings' && (
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Booking Enquiries by Trip</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{allBookings.length} {allBookings.length === 1 ? 'enquiry' : 'enquiries'} across {Object.keys(bookingsByTrip).length} trip{Object.keys(bookingsByTrip).length !== 1 ? 's' : ''}</p>
                                        </div>
                                    </div>

                                    {allBookings.length === 0 && (
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                                            No booking enquiries yet.
                                        </div>
                                    )}

                                    {/* Trip accordion */}
                                    {Object.entries(bookingsByTrip).map(([tripId, { tripTitle, byDate }]) => {
                                        const tripBookings = Object.values(byDate).flat();
                                        const confirmedCount = tripBookings.filter(b => b.status === 'confirmed').length;
                                        const totalTravelers = tripBookings.reduce((s, b) => s + (b.maleTravelers || 0) + (b.femaleTravelers || 0), 0);
                                        const totalRevenue = tripBookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalPrice || 0), 0);
                                        const isOpen = expandedTrips.has(tripId);

                                        return (
                                            <div key={tripId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                                {/* Trip header (clickable) */}
                                                <button
                                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left"
                                                    onClick={() => toggleTrip(tripId)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="bg-brand-purple/10 text-brand-purple rounded-lg p-2">
                                                            <Package size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-base">{tripTitle}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-3">
                                                                <span>{tripBookings.length} booking{tripBookings.length !== 1 ? 's' : ''}</span>
                                                                <span className="text-green-700 font-medium">{confirmedCount} confirmed</span>
                                                                <span>{totalTravelers} traveler{totalTravelers !== 1 ? 's' : ''}</span>
                                                                <span className="font-semibold text-gray-700">₹{totalRevenue.toLocaleString('en-IN')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <span className="text-xs">{Object.keys(byDate).length} date{Object.keys(byDate).length !== 1 ? 's' : ''}</span>
                                                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                    </div>
                                                </button>

                                                {/* Date groups inside trip */}
                                                {isOpen && (
                                                    <div className="border-t border-gray-100">
                                                        {Object.entries(byDate)
                                                            .sort(([a], [b]) => a.localeCompare(b))
                                                            .map(([date, dateBookings]) => {
                                                                const dateKey = `${tripId}__${date}`;
                                                                const isDateOpen = expandedDates.has(dateKey);
                                                                const dateConfirmed = dateBookings.filter(b => b.status === 'confirmed').length;
                                                                const dateTravelers = dateBookings.reduce((s, b) => s + (b.maleTravelers || 0) + (b.femaleTravelers || 0), 0);

                                                                return (
                                                                    <div key={date} className="border-b border-gray-50 last:border-b-0">
                                                                        {/* Date sub-header */}
                                                                        <div className="flex items-center justify-between px-6 py-3 bg-gray-50/60">
                                                                            <button
                                                                                className="flex items-center gap-3 text-left flex-1 hover:opacity-80 transition"
                                                                                onClick={() => toggleDate(dateKey)}
                                                                            >
                                                                                <div className="text-sm font-semibold text-gray-700">{date}</div>
                                                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                                    <span>{dateBookings.length} booking{dateBookings.length !== 1 ? 's' : ''}</span>
                                                                                    <span className="text-green-700">{dateConfirmed} confirmed</span>
                                                                                    <span>{dateTravelers} traveler{dateTravelers !== 1 ? 's' : ''}</span>
                                                                                </div>
                                                                                {isDateOpen ? <ChevronUp size={14} className="text-gray-400 ml-1" /> : <ChevronDown size={14} className="text-gray-400 ml-1" />}
                                                                            </button>
                                                                            {/* Manifest download button */}
                                                                            <button
                                                                                onClick={() => downloadManifestPDF(tripTitle, date, dateBookings)}
                                                                                title="Download boarding manifest PDF for this date"
                                                                                className="flex items-center gap-1.5 text-xs font-medium text-brand-purple border border-brand-purple/40 hover:bg-brand-purple/5 px-3 py-1.5 rounded-lg transition ml-3 flex-shrink-0"
                                                                            >
                                                                                <FileText size={14} />
                                                                                Manifest PDF
                                                                            </button>
                                                                        </div>

                                                                        {/* Bookings table for this date */}
                                                                        {isDateOpen && (
                                                                            <div className="overflow-x-auto">
                                                                                <table className="w-full text-left text-sm">
                                                                                    <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-semibold">
                                                                                        <tr>
                                                                                            <th className="px-6 py-3">Enquiry ID</th>
                                                                                            <th className="px-6 py-3">Customer</th>
                                                                                            <th className="px-6 py-3">Travelers</th>
                                                                                            <th className="px-6 py-3">Amount</th>
                                                                                            <th className="px-6 py-3">Status</th>
                                                                                            <th className="px-6 py-3 text-right">Actions</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-gray-50">
                                                                                        {dateBookings.map(booking => (
                                                                                            <tr key={booking.id} className="hover:bg-gray-50/50 transition">
                                                                                                <td className="px-6 py-3 font-mono text-xs text-gray-500">{booking.id}</td>
                                                                                                <td className="px-6 py-3">
                                                                                                    <div className="font-medium text-gray-900">{booking.customerName}</div>
                                                                                                    <div className="text-xs text-gray-400">{booking.email}</div>
                                                                                                    {booking.phone && <div className="text-xs text-gray-400">{booking.phone}</div>}
                                                                                                </td>
                                                                                                <td className="px-6 py-3 text-gray-700">{booking.maleTravelers + booking.femaleTravelers}</td>
                                                                                                <td className="px-6 py-3 font-medium text-gray-900">₹{booking.totalPrice?.toLocaleString('en-IN')}</td>
                                                                                                <td className="px-6 py-3">
                                                                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                                                                                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                                                                        booking.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                                                                                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                                                        booking.status === 'refunded' ? 'bg-gray-100 text-gray-600' :
                                                                                                        'bg-yellow-100 text-yellow-700'
                                                                                                    }`}>
                                                                                                        {booking.status}
                                                                                                    </span>
                                                                                                </td>
                                                                                                <td className="px-6 py-3 text-right">
                                                                                                    <div className="flex items-center justify-end gap-2">
                                                                                                        {/* Ticket PDF download */}
                                                                                                        <button
                                                                                                            onClick={() => downloadTicketPDF(booking)}
                                                                                                            title="Download ticket PDF"
                                                                                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-purple border border-gray-200 hover:border-brand-purple/40 px-2 py-1.5 rounded-lg transition"
                                                                                                        >
                                                                                                            <FileDown size={13} />
                                                                                                            Ticket
                                                                                                        </button>
                                                                                                        {/* Status actions */}
                                                                                                        <select
                                                                                                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white"
                                                                                                            value={booking.status}
                                                                                                            onChange={(e) => handleBookingStatusUpdate(booking.id, e.target.value as 'pending' | 'contacted' | 'confirmed' | 'cancelled' | 'refunded' | 'failed' | 'expired')}
                                                                                                        >
                                                                                                            <option value="pending">Pending</option>
                                                                                                            <option value="contacted">Contacted</option>
                                                                                                            <option value="confirmed">Confirmed</option>
                                                                                                            <option value="cancelled">Cancelled</option>
                                                                                                            <option value="refunded">Refunded</option>
                                                                                                            <option value="failed">Failed</option>
                                                                                                            <option value="expired">Expired</option>
                                                                                                        </select>
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === 'enquiries' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100"><h3 className="text-lg font-bold">Enquiries</h3></div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                                <tr>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4">Customer</th>
                                                    <th className="px-6 py-4">Contact / Details</th>
                                                    <th className="px-6 py-4">Message</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>

                                            <tbody className="divide-y divide-gray-100">
                                                {enquiries.map((enquiry) => (
                                                    <tr key={enquiry.id ?? enquiry.name} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString() : '—'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-gray-900">{enquiry.name ?? '—'}</div>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                {enquiry.where ?? enquiry.when ?? '—'}
                                                            </div>

                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Users size={14} /> <span>{(enquiry.maleTravelers || 0) + (enquiry.femaleTravelers || 0)} traveler{((enquiry.maleTravelers || 0) + (enquiry.femaleTravelers || 0)) > 1 ? 's' : ''}</span>
                                                            </div>

                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Phone size={14} /> <span>{enquiry.phone ?? '—'}</span>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            <div className="max-w-xs">
                                                                <p className="line-clamp-2 text-gray-600">{enquiry.message ?? '—'}</p>
                                                                {enquiry.message && enquiry.message.length > 100 && (
                                                                    <button 
                                                                        onClick={() => { setSelectedEnquiry(enquiry); setEnquiryModalOpen(true); }}
                                                                        className="text-brand-purple hover:text-brand-purple/70 text-xs font-bold mt-1"
                                                                    >
                                                                        View Full Message
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${enquiry.status === 'new'
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : enquiry.status === 'contacted'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                    }`}
                                                            >
                                                                {enquiry.status ?? 'new'}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-right">
                                                            {enquiry.status === 'new' && (
                                                                <button
                                                                    onClick={() => handleEnquiryStatus(enquiry.id ?? enquiry._id, 'contacted')}
                                                                    className="text-brand-purple hover:bg-purple-50 px-3 py-1 rounded text-sm font-medium border border-purple-200"
                                                                >
                                                                    Mark Contacted
                                                                </button>
                                                            )}

                                                            {enquiry.status === 'contacted' && (
                                                                <span className="text-green-600 text-sm flex items-center justify-end gap-1">
                                                                    <CheckCircle size={16} /> Done
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}


                            {activeTab === 'trips' && (
                                <div className="space-y-4">
                                {/* Image dimensions quick-reference card for trips tab */}
                                <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ImageIcon size={16} className="text-amber-600" />
                                        <span className="font-bold text-amber-800 text-sm">📐 Admin Image Size Guide — use these exact dimensions when uploading images</span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                                        {[
                                            { label: 'Cover / Hero', size: '1920 × 1080', ratio: '16:9', bg: '#f5f3ff', border: '#ede9fe', text: '#5b21b6', hint: 'Trip detail hero' },
                                            { label: 'Card Thumbnail', size: '800 × 600', ratio: '4:3', bg: '#eff6ff', border: '#dbeafe', text: '#1d4ed8', hint: 'Destinations listing' },
                                            { label: 'Trip Gallery', size: '1200 × 800', ratio: '3:2', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', hint: 'Trip photo grid' },
                                            { label: 'Hero Carousel', size: '1920 × 1080', ratio: '16:9', bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', hint: 'Home slideshow' },
                                            { label: 'Landing Gallery', size: '800 × 800', ratio: '1:1', bg: '#fdf2f8', border: '#f5d0fe', text: '#a21caf', hint: 'Home gallery grid' },
                                            { label: 'Review Avatar', size: '200 × 200', ratio: '1:1', bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca', hint: 'Testimonial photo' },
                                        ].map(({ label, size, ratio, bg, border, text, hint }) => (
                                            <div key={label} style={{ background: bg, border: `1px solid ${border}` }} className="rounded-lg p-3 text-center">
                                                <div style={{ color: text }} className="font-bold text-[11px] mb-1">{label}</div>
                                                <div style={{ color: text }} className="font-mono font-black text-[13px]">{size}</div>
                                                <div style={{ color: text, opacity: 0.7 }} className="text-[10px] mt-0.5">{ratio} ratio</div>
                                                <div className="text-gray-400 text-[9px] mt-1 italic">{hint}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800">Manage Trips</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                                <tr>
                                                    <th className="px-6 py-4">Trip Name</th>
                                                    <th className="px-6 py-4">Location</th>
                                                    <th className="px-6 py-4">Price</th>
                                                    <th className="px-6 py-4">GST %</th>
                                                    <th className="px-6 py-4">Duration</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {trips.map((trip) => (
                                                    <tr key={trip.id} className={`hover:bg-gray-50 transition ${trip.isActive === false ? 'opacity-60' : ''}`}>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img src={trip.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                                <div>
                                                                    <span className="font-medium text-gray-900 line-clamp-1">{trip.title}</span>
                                                                    <span className="text-xs text-gray-400 block mt-0.5">
                                                                        {trip.slug && <span className="flex items-center gap-1"><LinkIcon size={10} /> {trip.slug}</span>}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600 text-sm">{trip.location}</td>
                                                        <td className="px-6 py-4 text-gray-900 font-medium text-sm">₹{trip.price.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-gray-600 text-sm">{trip.gstPercentage ?? 5}%</td>
                                                        <td className="px-6 py-4 text-gray-600 text-sm">{trip.duration}</td>
                                                        <td className="px-6 py-4">
                                                            <button
                                                                onClick={() => handleToggleStatus(trip.id)}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${trip.isActive !== false
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                    }`}
                                                                title={trip.isActive !== false ? 'Click to deactivate' : 'Click to activate'}
                                                            >
                                                                {trip.isActive !== false ? (
                                                                    <>
                                                                        <ToggleRight size={16} className="text-green-600" />
                                                                        Active
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ToggleLeft size={16} className="text-gray-400" />
                                                                        Inactive
                                                                    </>
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => openEditModal(trip)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(trip.id)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                </div>
                            )}

                            {activeTab === 'gallery' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800">Gallery Management</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Manage images displayed in the landing page gallery.{' '}
                                            <span className="font-semibold text-pink-600">Recommended size: 800 × 800 px (1:1 square)</span>
                                        </p>
                                    </div>

                                    {/* Upload Section */}
                                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                                        <div className="flex flex-col md:flex-row gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Image Caption (optional)</label>
                                                <input
                                                    type="text"
                                                    value={newGalleryCaption}
                                                    onChange={(e) => setNewGalleryCaption(e.target.value)}
                                                    placeholder="Enter caption for the image"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    ref={galleryInputRef}
                                                    onChange={handleGalleryUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="gallery-upload"
                                                />
                                                <label
                                                    htmlFor="gallery-upload"
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition ${galleryUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-purple text-white hover:bg-brand-darkPurple'}`}
                                                >
                                                    {galleryUploading ? (
                                                        <>
                                                            <Loader size={18} className="animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={18} />
                                                            Upload Image
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gallery Grid */}
                                    <div className="p-6">
                                        {galleryImages.length === 0 ? (
                                            <div className="text-center py-12 text-gray-400">
                                                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>No gallery images yet. Upload some images to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {galleryImages.map((img) => (
                                                    <div key={img.id} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-100">
                                                        <img
                                                            src={img.imageUrl}
                                                            alt={img.caption || 'Gallery image'}
                                                            className="w-full h-40 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                onClick={() => handleDeleteGalleryImage(img.id)}
                                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                        {img.caption && (
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                                                                {img.caption}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800">Reviews Management</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Manage testimonials displayed on the landing page.{' '}
                                            <span className="font-semibold text-purple-600">Avatar: 200 × 200 px (1:1 square)</span>
                                        </p>
                                    </div>

                                    {/* Add Review Form */}
                                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                                <input
                                                    type="text"
                                                    value={newReview.name}
                                                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                                                    placeholder="Customer name"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                                                <input
                                                    type="text"
                                                    value={newReview.location}
                                                    onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                                                    placeholder="e.g. Mumbai, India"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Review *</label>
                                            <textarea
                                                value={newReview.quote}
                                                onChange={(e) => setNewReview({ ...newReview, quote: e.target.value })}
                                                placeholder="Customer's testimonial..."
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                                                <select
                                                    value={newReview.rating}
                                                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                                >
                                                    {[5, 4, 3, 2, 1].map(r => (
                                                        <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar *</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="file"
                                                        ref={reviewAvatarInputRef}
                                                        onChange={handleReviewAvatarUpload}
                                                        accept="image/*"
                                                        className="hidden"
                                                        id="review-avatar-upload"
                                                    />
                                                    <label
                                                        htmlFor="review-avatar-upload"
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition ${reviewAvatarUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                    >
                                                        {reviewAvatarUploading ? (
                                                            <>
                                                                <Loader size={16} className="animate-spin" />
                                                                Uploading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload size={16} />
                                                                {newReview.avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
                                                            </>
                                                        )}
                                                    </label>
                                                    {newReview.avatarUrl && (
                                                        <img src={newReview.avatarUrl} alt="Avatar preview" className="w-10 h-10 rounded-full object-cover" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleAddReview}
                                            disabled={reviewUploading}
                                            className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${reviewUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-purple text-white hover:bg-brand-darkPurple'}`}
                                        >
                                            {reviewUploading ? (
                                                <>
                                                    <Loader size={18} className="animate-spin" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <PlusCircle size={18} />
                                                    Add Review
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Reviews List */}
                                    <div className="p-6">
                                        {reviews.length === 0 ? (
                                            <div className="text-center py-12 text-gray-400">
                                                <Star size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>No reviews yet. Add some testimonials to get started.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {reviews.map((review) => (
                                                    <div key={review.id} className="relative p-4 bg-gray-50 rounded-lg border border-gray-100 group">
                                                        <div className="flex items-start gap-3">
                                                            <img
                                                                src={review.avatarUrl}
                                                                alt={review.name}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-1 mb-1">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            size={14}
                                                                            className={i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <h4 className="font-semibold text-gray-800">{review.name}</h4>
                                                                <p className="text-xs text-gray-500">{review.location}</p>
                                                                <p className="text-sm text-gray-600 mt-2 italic">"{review.quote}"</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteReview(review.id)}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ticker' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800">Ticker Tape Management</h3>
                                        <p className="text-sm text-gray-500 mt-1">Manage the scrolling announcements on the homepage</p>
                                    </div>

                                    {/* Add Ticker Form */}
                                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                                        <h4 className="font-semibold text-gray-700 mb-4">Add New Ticker Item</h4>
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Text *</label>
                                                <input
                                                    type="text"
                                                    value={newTickerText}
                                                    onChange={(e) => setNewTickerText(e.target.value)}
                                                    placeholder="e.g. New Year Sale - 20% Off!"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                                />
                                            </div>
                                            <div className="w-full md:w-48">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                                <select
                                                    value={newTickerIcon}
                                                    onChange={(e) => setNewTickerIcon(e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                                >
                                                    {iconOptions.map(icon => (
                                                        <option key={icon} value={icon}>{icon}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                onClick={handleAddTicker}
                                                className="bg-brand-purple text-white px-6 py-2 rounded-lg hover:bg-brand-darkPurple transition flex items-center gap-2 h-fit md:mt-6"
                                            >
                                                <PlusCircle size={18} /> Add
                                            </button>
                                        </div>
                                    </div>

                                    {/* Ticker Items List */}
                                    <div className="p-6">
                                        {tickerItems.length === 0 ? (
                                            <div className="text-center py-12 text-gray-400">
                                                <Megaphone size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>No ticker items yet. Add some announcements to display on the homepage.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {tickerItems.map((item) => (
                                                    <div
                                                        key={item._id}
                                                        className={`flex items-center justify-between p-4 rounded-lg border transition ${item.isActive
                                                            ? 'bg-white border-gray-200'
                                                            : 'bg-gray-100 border-gray-200 opacity-60'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3 flex-1">
                                                            <span className="text-brand-purple font-mono text-sm bg-purple-50 px-2 py-1 rounded">{item.icon}</span>
                                                            <span className={`text-gray-800 ${!item.isActive && 'line-through'}`}>{item.text}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleToggleTicker(item._id)}
                                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition ${item.isActive
                                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                                                    }`}
                                                                title={item.isActive ? 'Click to deactivate' : 'Click to activate'}
                                                            >
                                                                {item.isActive ? (
                                                                    <>
                                                                        <ToggleRight size={16} className="text-green-600" />
                                                                        Active
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ToggleLeft size={16} className="text-gray-400" />
                                                                        Inactive
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTicker(item._id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'hero' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800">Hero Carousel Management</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Manage the hero carousel images on the homepage.{' '}
                                            <span className="font-semibold text-orange-600">Recommended size: 1920 × 1080 px (16:9) for full-width display</span>
                                        </p>
                                    </div>

                                    {/* Upload Section */}
                                    <div className="p-6 bg-gray-50 border-b border-gray-100">
                                        <div className="flex flex-col md:flex-row gap-4 items-end">
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Image Caption (optional)</label>
                                                <input
                                                    type="text"
                                                    value={newHeroCaption}
                                                    onChange={(e) => setNewHeroCaption(e.target.value)}
                                                    placeholder="e.g. Hampi Ruins"
                                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="file"
                                                    ref={heroInputRef}
                                                    onChange={handleHeroUpload}
                                                    accept="image/*"
                                                    className="hidden"
                                                    id="hero-upload"
                                                />
                                                <label
                                                    htmlFor="hero-upload"
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition ${heroUploading ? 'bg-gray-300 cursor-not-allowed' : 'bg-brand-purple text-white hover:bg-brand-darkPurple'}`}
                                                >
                                                    {heroUploading ? (
                                                        <>
                                                            <Loader size={18} className="animate-spin" />
                                                            Uploading...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload size={18} />
                                                            Upload Hero Image
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-3">
                                            💡 Upload images in <strong>1200×800 px</strong> (landscape, 3:2 ratio) for optimal quality. Supports JPG, PNG, WebP.
                                        </p>
                                    </div>

                                    {/* Hero Images Grid */}
                                    <div className="p-6">
                                        {heroImages.length === 0 ? (
                                            <div className="text-center py-12 text-gray-400">
                                                <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>No hero images yet. Upload images to display in the homepage carousel.</p>
                                                <p className="text-xs mt-2">Minimum 1 image required; up to 10 can be added.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {heroImages.map((img, idx) => (
                                                    <div key={img.id} className={`relative group rounded-lg overflow-hidden shadow-sm border ${img.isActive ? 'border-green-300' : 'border-gray-200 opacity-60'}`}>
                                                        <img
                                                            src={img.imageUrl}
                                                            alt={img.caption || `Hero ${idx + 1}`}
                                                            className="w-full h-40 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                                            <button
                                                                onClick={() => handleToggleHeroImage(img.id, !img.isActive)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${img.isActive ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}
                                                            >
                                                                {img.isActive ? <><ToggleLeft size={14} /> Hide</> : <><ToggleRight size={14} /> Show</>}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteHeroImage(img.id)}
                                                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="p-2 bg-white">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-gray-600 truncate">{img.caption || <span className="italic text-gray-400">No caption</span>}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${img.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                                    {img.isActive ? 'Visible' : 'Hidden'}
                                                                </span>
                                                            </div>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">Slide {idx + 1}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'team' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800">Team Members</h3>
                                        <p className="text-sm text-gray-500 mt-1">Manage team members displayed on the Team page.</p>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-500 mb-4">You can add, edit, or remove team members here.</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {teamMembers.map((member) => (
                                                <div key={member._id} className="border border-gray-200 rounded-lg p-4 flex gap-4 items-center">
                                                    <img src={member.imageUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-800">{member.name}</h4>
                                                        <p className="text-sm text-gray-500">{member.role}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEditTeam(member)} className="text-brand-purple p-2 hover:bg-purple-50 rounded">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteTeam(member._id)} className="text-red-500 p-2 hover:bg-red-50 rounded">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={handleAddTeam} className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:text-brand-purple hover:border-brand-purple transition min-h-[100px]">
                                                <PlusCircle size={24} className="mb-2" />
                                                <span className="font-bold">Add Member</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-800">Site Settings</h3>
                                        <p className="text-sm text-gray-500 mt-1">Manage dynamic content for Home, Our Story, and Contact Us pages.</p>
                                    </div>
                                    <div className="p-6 space-y-8">
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-bold text-gray-800 mb-2">Home Page Quick Tags</h4>
                                            <p className="text-sm text-gray-500 mb-4">Edit the 4 locations shown in the search bar.</p>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    defaultValue={siteSettings.find(s => s.key === 'home_quick_tags')?.value?.join(', ') || 'Hampi, Gokarna, Wayanad, Pondicherry'}
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                                                    id="quick-tags-input"
                                                />
                                                <button onClick={async () => {
                                                    const val = (document.getElementById('quick-tags-input') as HTMLInputElement).value;
                                                    await api.updateSetting('home_quick_tags', { value: val.split(',').map(s => s.trim()) });
                                                    alert('Updated Quick Tags!');
                                                }} className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold">Save</button>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-bold text-gray-800 mb-4">Home Page Stats</h4>
                                            <div className="space-y-4">
                                                {(() => {
                                                    const currentStats = siteSettings.find(s => s.key === 'home_stats')?.value || [
                                                        { end: 150, suffix: '+', label: 'Trips Done', iconName: 'Trophy' },
                                                        { end: 5000, suffix: '+', label: 'Travelers', iconName: 'Users' },
                                                        { end: 25, suffix: '+', label: 'Spots', iconName: 'Map' },
                                                        { end: 40, suffix: '%', label: 'Solo Women', iconName: 'Heart' }
                                                    ];
                                                    return (
                                                        <form onSubmit={async (e) => {
                                                            e.preventDefault();
                                                            const formData = new FormData(e.target as HTMLFormElement);
                                                            const newStats = [];
                                                            for(let i=0; i<4; i++) {
                                                                newStats.push({
                                                                    end: parseInt(formData.get(`stat_${i}_end`) as string) || 0,
                                                                    suffix: formData.get(`stat_${i}_suffix`),
                                                                    label: formData.get(`stat_${i}_label`),
                                                                    iconName: formData.get(`stat_${i}_iconName`)
                                                                });
                                                            }
                                                            await api.updateSetting('home_stats', { value: newStats });
                                                            alert('Home Stats updated!');
                                                        }}>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                                {currentStats.map((stat: any, i: number) => (
                                                                    <div key={i} className="border p-3 rounded bg-white">
                                                                        <h5 className="font-bold mb-2 text-sm text-gray-600">Stat {i+1}</h5>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <input type="number" name={`stat_${i}_end`} defaultValue={stat.end} placeholder="Number (e.g. 150)" className="w-full px-2 py-1 border rounded" required />
                                                                            <input type="text" name={`stat_${i}_suffix`} defaultValue={stat.suffix} placeholder="Suffix (e.g. +)" className="w-full px-2 py-1 border rounded" />
                                                                            <input type="text" name={`stat_${i}_label`} defaultValue={stat.label} placeholder="Label (e.g. Trips)" className="w-full px-2 py-1 border rounded" required />
                                                                            <select name={`stat_${i}_iconName`} defaultValue={stat.iconName} className="w-full px-2 py-1 border rounded">
                                                                                <option value="Trophy">Trophy</option>
                                                                                <option value="Users">Users</option>
                                                                                <option value="Map">Map</option>
                                                                                <option value="Heart">Heart</option>
                                                                                <option value="Star">Star</option>
                                                                                <option value="Zap">Zap</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button type="submit" className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold">Save Home Stats</button>
                                                        </form>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-bold text-gray-800 mb-4">Our Story Content</h4>
                                            <div className="space-y-4">
                                                {(() => {
                                                    const currentStory = siteSettings.find(s => s.key === 'our_story_content')?.value || {
                                                        heading: "OUR STORY",
                                                        subHeading: "Born from a passion for the wild and a love for authentic adventures.",
                                                        section1Title: "The Beginning",
                                                        section1Text1: "Wheel to Wilderness started in 2019...",
                                                        section2Title: "Our Mission",
                                                        section2Text: "We believe that travel has the power to transform lives..."
                                                    };
                                                    return (
                                                        <form onSubmit={async (e) => {
                                                            e.preventDefault();
                                                            const formData = new FormData(e.target as HTMLFormElement);
                                                            const data = {
                                                                heading: formData.get('heading'),
                                                                subHeading: formData.get('subHeading'),
                                                                section1Title: formData.get('section1Title'),
                                                                section1Text1: formData.get('section1Text1'),
                                                                section2Title: formData.get('section2Title'),
                                                                section2Text: formData.get('section2Text'),
                                                                heroImage: currentStory.heroImage || "https://picsum.photos/id/1036/1920/800"
                                                            };
                                                            await api.updateSetting('our_story_content', { value: data });
                                                            alert('Our Story updated!');
                                                        }}>
                                                            <input type="text" name="heading" defaultValue={currentStory.heading} placeholder="Heading" className="w-full px-4 py-2 border rounded-lg mb-2" />
                                                            <input type="text" name="subHeading" defaultValue={currentStory.subHeading} placeholder="Sub Heading" className="w-full px-4 py-2 border rounded-lg mb-2" />
                                                            <input type="text" name="section1Title" defaultValue={currentStory.section1Title} placeholder="Section 1 Title" className="w-full px-4 py-2 border rounded-lg mb-2" />
                                                            <textarea name="section1Text1" defaultValue={currentStory.section1Text1} placeholder="Section 1 Text" className="w-full px-4 py-2 border rounded-lg mb-2 h-24"></textarea>
                                                            <input type="text" name="section2Title" defaultValue={currentStory.section2Title} placeholder="Section 2 Title" className="w-full px-4 py-2 border rounded-lg mb-2" />
                                                            <textarea name="section2Text" defaultValue={currentStory.section2Text} placeholder="Section 2 Text" className="w-full px-4 py-2 border rounded-lg mb-2 h-24"></textarea>
                                                            <button type="submit" className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold">Save Our Story</button>
                                                        </form>
                                                    );
                                                })()}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <h4 className="font-bold text-gray-800 mb-4">Contact Us Content</h4>
                                            <div className="space-y-4">
                                                {(() => {
                                                    const currentContact = siteSettings.find(s => s.key === 'contact_us_content')?.value || {
                                                        phone: "+91 96064 99422",
                                                        phoneDesc: "Mon-Sat, 9AM - 7PM IST",
                                                        email: "experiences@wheelstowilderness.in",
                                                        emailDesc: "We reply within 24 hours",
                                                        address: "Bangalore, Karnataka",
                                                        addressDesc: "By appointment only"
                                                    };
                                                    return (
                                                        <form onSubmit={async (e) => {
                                                            e.preventDefault();
                                                            const formData = new FormData(e.target as HTMLFormElement);
                                                            const data = {
                                                                phone: formData.get('phone'),
                                                                phoneDesc: formData.get('phoneDesc'),
                                                                email: formData.get('email'),
                                                                emailDesc: formData.get('emailDesc'),
                                                                address: formData.get('address'),
                                                                addressDesc: formData.get('addressDesc'),
                                                            };
                                                            await api.updateSetting('contact_us_content', { value: data });
                                                            alert('Contact Us updated!');
                                                        }}>
                                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                                <input type="text" name="phone" defaultValue={currentContact.phone} placeholder="Phone" className="w-full px-4 py-2 border rounded-lg" />
                                                                <input type="text" name="phoneDesc" defaultValue={currentContact.phoneDesc} placeholder="Phone Description" className="w-full px-4 py-2 border rounded-lg" />
                                                                <input type="text" name="email" defaultValue={currentContact.email} placeholder="Email" className="w-full px-4 py-2 border rounded-lg" />
                                                                <input type="text" name="emailDesc" defaultValue={currentContact.emailDesc} placeholder="Email Description" className="w-full px-4 py-2 border rounded-lg" />
                                                                <input type="text" name="address" defaultValue={currentContact.address} placeholder="Address" className="w-full px-4 py-2 border rounded-lg" />
                                                                <input type="text" name="addressDesc" defaultValue={currentContact.addressDesc} placeholder="Address Description" className="w-full px-4 py-2 border rounded-lg" />
                                                            </div>
                                                            <button type="submit" className="bg-brand-purple text-white px-4 py-2 rounded-lg font-bold">Save Contact Info</button>
                                                        </form>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Trip' : 'Create New Trip'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-8">
                            {/* Section 1: Basic Info */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Trip Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={currentTrip.title}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            placeholder="e.g. Weekend at Hampi"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Category (Home Page Section)</label>
                                        <input
                                            type="text"
                                            name="category"
                                            value={currentTrip.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            placeholder="e.g. Trending Expeditions, Independence Day Special"
                                            required
                                        />
                                    </div>
                                    {/* ... (Existing inputs for slug, location, price, duration) ... */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                            URL Slug <span className="text-xs font-normal text-gray-400 font-mono">(auto-generated if empty)</span>
                                        </label>
                                        <div className="flex items-center">
                                            <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-2 text-gray-500 text-sm font-mono">/trip/</span>
                                            <input
                                                type="text"
                                                name="slug"
                                                value={currentTrip.slug}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 rounded-r-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none font-mono text-sm"
                                                placeholder="hampi-weekend-getaway"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={currentTrip.location}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            placeholder="e.g. Karnataka, India"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={currentTrip.price}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Duration</label>
                                        <input
                                            type="text"
                                            name="duration"
                                            value={currentTrip.duration}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            placeholder="e.g. 2 Days / 1 Night"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Max Male Capacity</label>
                                        <input
                                            type="number"
                                            name="maxMaleCapacity"
                                            value={currentTrip.maxMaleCapacity || 6}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            placeholder="6"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Max Female Capacity</label>
                                        <input
                                            type="number"
                                            name="maxFemaleCapacity"
                                            value={currentTrip.maxFemaleCapacity || 6}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            placeholder="6"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">GST (%)</label>
                                        <input
                                            type="number"
                                            name="gstPercentage"
                                            value={currentTrip.gstPercentage ?? 5}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                                            placeholder="5"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Media & Description (UPDATED FOR IMAGE UPLOAD) */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">Media & Details</h4>

                                {/* ── Image Dimension Quick-Reference ── */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ImageIcon size={16} className="text-amber-600" />
                                        <span className="text-sm font-bold text-amber-800">📐 Image Size Reference — upload exactly these dimensions for best results</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                        <div className="bg-white rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                                            <div className="bg-brand-purple/10 text-brand-purple rounded p-1.5 shrink-0 mt-0.5"><ImageIcon size={14} /></div>
                                            <div>
                                                <div className="font-bold text-gray-800">Cover / Hero Image</div>
                                                <div className="font-mono text-brand-purple font-semibold mt-0.5">1920 × 1080 px</div>
                                                <div className="text-gray-400 mt-0.5">Ratio 16:9 · JPG/WEBP · ≤ 5 MB</div>
                                                <div className="text-gray-500 mt-0.5 italic">Full-bleed hero on Trip Detail page</div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                                            <div className="bg-blue-100 text-blue-600 rounded p-1.5 shrink-0 mt-0.5"><ImageIcon size={14} /></div>
                                            <div>
                                                <div className="font-bold text-gray-800">Card / Thumbnail Image</div>
                                                <div className="font-mono text-blue-600 font-semibold mt-0.5">800 × 600 px</div>
                                                <div className="text-gray-400 mt-0.5">Ratio 4:3 · JPG/WEBP · ≤ 3 MB</div>
                                                <div className="text-gray-500 mt-0.5 italic">Trip listing cards on Destinations page</div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                                            <div className="bg-green-100 text-green-600 rounded p-1.5 shrink-0 mt-0.5"><ImageIcon size={14} /></div>
                                            <div>
                                                <div className="font-bold text-gray-800">Trip Gallery Photos</div>
                                                <div className="font-mono text-green-600 font-semibold mt-0.5">1200 × 800 px</div>
                                                <div className="text-gray-400 mt-0.5">Ratio 3:2 · JPG/WEBP · ≤ 4 MB each</div>
                                                <div className="text-gray-500 mt-0.5 italic">Photo grid on Trip Detail page</div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                                            <div className="bg-orange-100 text-orange-600 rounded p-1.5 shrink-0 mt-0.5"><ImageIcon size={14} /></div>
                                            <div>
                                                <div className="font-bold text-gray-800">Hero Carousel (Home page)</div>
                                                <div className="font-mono text-orange-600 font-semibold mt-0.5">1920 × 1080 px</div>
                                                <div className="text-gray-400 mt-0.5">Ratio 16:9 · JPG/WEBP · ≤ 5 MB</div>
                                                <div className="text-gray-500 mt-0.5 italic">Full-width slideshow on Home page</div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                                            <div className="bg-pink-100 text-pink-600 rounded p-1.5 shrink-0 mt-0.5"><ImageIcon size={14} /></div>
                                            <div>
                                                <div className="font-bold text-gray-800">Landing Page Gallery</div>
                                                <div className="font-mono text-pink-600 font-semibold mt-0.5">800 × 800 px</div>
                                                <div className="text-gray-400 mt-0.5">Ratio 1:1 square · JPG/WEBP · ≤ 3 MB</div>
                                                <div className="text-gray-500 mt-0.5 italic">Gallery grid on the landing page</div>
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                                            <div className="bg-purple-100 text-purple-600 rounded p-1.5 shrink-0 mt-0.5"><ImageIcon size={14} /></div>
                                            <div>
                                                <div className="font-bold text-gray-800">Review / Avatar Photo</div>
                                                <div className="font-mono text-purple-600 font-semibold mt-0.5">200 × 200 px</div>
                                                <div className="text-gray-400 mt-0.5">Ratio 1:1 square · JPG/PNG · ≤ 1 MB</div>
                                                <div className="text-gray-500 mt-0.5 italic">Testimonial profile picture</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cover/Hero Image Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Cover/Hero Image
                                        <span className="text-xs font-normal text-gray-500 ml-2">(Recommended: 1920x1080px, 16:9 ratio)</span>
                                    </label>
                                    <div className="flex gap-4 items-start">
                                        {currentTrip.imageUrl && (
                                            <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                                                <img src={currentTrip.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                ref={mainImageInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'main')}
                                            />
                                            <div className="flex gap-2 mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => mainImageInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                                >
                                                    {isUploading ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                                                    Upload Image
                                                </button>
                                                <input
                                                    type="text"
                                                    name="imageUrl"
                                                    value={currentTrip.imageUrl}
                                                    onChange={handleInputChange}
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none text-sm"
                                                    placeholder="Or paste image URL"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">Used on trip detail page hero section. Supported formats: JPG, PNG, WEBP. Max size: 5MB.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card/Thumbnail Image Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Card/Thumbnail Image
                                        <span className="text-xs font-normal text-gray-500 ml-2">(Recommended: 800x600px, 4:3 ratio)</span>
                                    </label>
                                    <div className="flex gap-4 items-start">
                                        {currentTrip.cardImageUrl && (
                                            <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                                                <img src={currentTrip.cardImageUrl} alt="Card" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                ref={cardImageInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, 'card')}
                                            />
                                            <div className="flex gap-2 mb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => cardImageInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                                >
                                                    {isUploading ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                                                    Upload Image
                                                </button>
                                                <input
                                                    type="text"
                                                    name="cardImageUrl"
                                                    value={currentTrip.cardImageUrl || ''}
                                                    onChange={handleInputChange}
                                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none text-sm"
                                                    placeholder="Or paste image URL (optional)"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500">Used in trip listing cards. If not provided, cover image will be used. Supported formats: JPG, PNG, WEBP. Max size: 5MB.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Gallery Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Gallery Images</label>
                                    <input
                                        type="file"
                                        ref={galleryImageInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'gallery')}
                                    />
                                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mb-3">
                                        {currentTrip.gallery?.map((url, i) => (
                                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                                <img src={url} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => updateArrayField('gallery', currentTrip.gallery!.filter((_, idx) => idx !== i))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => galleryImageInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-brand-purple hover:text-brand-purple transition bg-gray-50"
                                        >
                                            {isUploading ? <Loader className="animate-spin" size={20} /> : <Plus size={24} />}
                                            <span className="text-xs font-bold mt-1">Add</span>
                                        </button>
                                    </div>
                                    <ArrayInput
                                        label="Gallery Image URLs (Manual Add)"
                                        items={currentTrip.gallery || []}
                                        onChange={items => updateArrayField('gallery', items)}
                                        placeholder="Paste image URL..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        name="description"
                                        value={currentTrip.description}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-purple focus:outline-none h-32"
                                        placeholder="Describe the adventure..."
                                    ></textarea>
                                </div>
                            </div>

                            {/* Section 3: Lists (Highlights, Inclusions, etc) */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">Trip Features</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <ArrayInput
                                        label="Highlights"
                                        items={currentTrip.highlights || []}
                                        onChange={items => updateArrayField('highlights', items)}
                                    />
                                    <ArrayInput
                                        label="Pickup Points"
                                        items={currentTrip.pickupPoints || []}
                                        onChange={items => updateArrayField('pickupPoints', items)}
                                    />
                                    <ArrayInput
                                        label="Inclusions"
                                        items={currentTrip.inclusions || []}
                                        onChange={items => updateArrayField('inclusions', items)}
                                    />
                                    <ArrayInput
                                        label="Exclusions"
                                        items={currentTrip.exclusions || []}
                                        onChange={items => updateArrayField('exclusions', items)}
                                    />
                                    <ArrayInput
                                        label="Available Dates"
                                        items={currentTrip.dates || []}
                                        onChange={items => updateArrayField('dates', items)}
                                        placeholder="e.g. Dec 25 - Dec 27"
                                    />
                                </div>
                            </div>

                            {/* Section 4: Itinerary */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">Itinerary</h4>
                                <ItineraryInput
                                    itinerary={currentTrip.itinerary || []}
                                    onChange={items => updateArrayField('itinerary', items)}
                                />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white p-4 -mx-6 -mb-6 shadow-inner z-20">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="px-6 py-2 rounded-lg bg-brand-purple text-white font-bold hover:bg-brand-darkPurple transition flex items-center gap-2 disabled:opacity-70"
                                >
                                    <Save size={18} /> {isUploading ? 'Uploading...' : 'Save Trip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Enquiry Detail Modal */}
            {enquiryModalOpen && selectedEnquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-gray-900">Enquiry Details</h3>
                            <button onClick={() => { setEnquiryModalOpen(false); setSelectedEnquiry(null); }} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">Contact Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                                        <p className="text-gray-900 font-medium">{selectedEnquiry.name ?? '—'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                        <p className="text-gray-900 font-medium break-all">{selectedEnquiry.email ?? '—'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                        <p className="text-gray-900 font-medium">{selectedEnquiry.phone ?? '—'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Submitted On</label>
                                        <p className="text-gray-900 font-medium">
                                            {selectedEnquiry.createdAt ? new Date(selectedEnquiry.createdAt).toLocaleString() : '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Information */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">Trip Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Destination</label>
                                        <p className="text-gray-900 font-medium">{selectedEnquiry.where ?? '—'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Travel Date</label>
                                        <p className="text-gray-900 font-medium">
                                            {selectedEnquiry.when ? new Date(selectedEnquiry.when).toLocaleDateString() : '—'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Number of Travelers</label>
                                        <p className="text-gray-900 font-medium">{(selectedEnquiry.maleTravelers || 0) + (selectedEnquiry.femaleTravelers || 0)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Message */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">Message</h4>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {selectedEnquiry.message ?? '—'}
                                    </p>
                                </div>
                            </div>

                            {/* Status and Actions */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 border-b pb-2">Status</h4>
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedEnquiry.status === 'new'
                                            ? 'bg-orange-100 text-orange-700'
                                            : selectedEnquiry.status === 'contacted'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {selectedEnquiry.status ?? 'new'}
                                    </span>
                                    {selectedEnquiry.status === 'new' && (
                                        <button
                                            onClick={() => {
                                                handleEnquiryStatus(selectedEnquiry.id ?? selectedEnquiry._id, 'contacted');
                                                setEnquiryModalOpen(false);
                                                setSelectedEnquiry(null);
                                            }}
                                            className="text-brand-purple hover:bg-purple-50 px-4 py-2 rounded text-sm font-bold border border-purple-200"
                                        >
                                            Mark as Contacted
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Member Modal */}
            {isTeamModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex justify-between items-center z-10">
                            <h3 className="text-xl font-bold text-gray-900">{isEditingTeam ? 'Edit Team Member' : 'Add Team Member'}</h3>
                            <button onClick={() => setIsTeamModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleTeamSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                <input type="text" required value={currentTeamMember.name || ''} onChange={e => setCurrentTeamMember({...currentTeamMember, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                                <input type="text" required value={currentTeamMember.role || ''} onChange={e => setCurrentTeamMember({...currentTeamMember, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Photo</label>
                                {currentTeamMember.imageUrl && (
                                    <div className="mb-3">
                                        <img src={currentTeamMember.imageUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <label className="cursor-pointer bg-brand-purple text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-darkPurple transition flex items-center gap-2">
                                        <Upload size={16} />
                                        {isUploading ? 'Uploading...' : 'Upload Image'}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={isUploading}
                                            onChange={async (e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setIsUploading(true);
                                                    try {
                                                        const url = await uploadToCloudinary(e.target.files[0]);
                                                        setCurrentTeamMember(prev => ({ ...prev, imageUrl: url }));
                                                    } catch (err: any) {
                                                        alert(err.message || 'Upload failed');
                                                    } finally {
                                                        setIsUploading(false);
                                                        e.target.value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </label>
                                    {isUploading && <Loader size={20} className="animate-spin text-brand-purple" />}
                                </div>
                                {!currentTeamMember.imageUrl && <p className="text-xs text-red-500 mt-1">* Photo is required</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                                <textarea required value={currentTeamMember.bio || ''} onChange={e => setCurrentTeamMember({...currentTeamMember, bio: e.target.value})} className="w-full px-4 py-2 border rounded-lg h-24" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">LinkedIn (Optional)</label>
                                    <input type="text" value={currentTeamMember.linkedin || ''} onChange={e => setCurrentTeamMember({...currentTeamMember, linkedin: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Instagram (Optional)</label>
                                    <input type="text" value={currentTeamMember.instagram || ''} onChange={e => setCurrentTeamMember({...currentTeamMember, instagram: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
                                <button type="submit" className="bg-brand-purple text-white px-6 py-2 rounded-lg font-bold">Save Member</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;