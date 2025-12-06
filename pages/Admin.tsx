import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Package, Users, DollarSign, PlusCircle, Settings, Edit, Trash2, X, Save, Search, CheckCircle, RefreshCcw, MessageSquare, Mail, Phone, Plus, Minus, ChevronDown, ChevronUp, Link as LinkIcon, Upload, Image as ImageIcon, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/uploadService';
import { Trip, BookingStats, Booking, Enquiry, ItineraryItem } from '../types';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';

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
                        <span>{item}</span>
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
        if(!activity.trim()) return;
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
                                     <button type="button" onClick={() => removeActivity(dayIndex, actIndex)} className="absolute right-0 top-0 text-red-300 hover:text-red-500 hidden group-hover/act:block"><X size={12}/></button>
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
                                    if(e.key === 'Enter') {
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
                                className="bg-gray-100 px-3 py-1 rounded text-sm hover:bg-gray-200"
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trips' | 'bookings' | 'enquiries'>('overview');
  const { user, isAdmin, loading: authLoading } = useAuth();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Partial<Trip>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Refs for file inputs
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tripsData, statsData, bookingsData, enquiriesData] = await Promise.all([
        api.getTrips(),
        api.getStats(),
        api.getAllBookings(),
        api.getEnquiries()
      ]);
      setTrips(tripsData);
      setStats(statsData);
      setAllBookings(bookingsData);
      setEnquiries(enquiriesData);
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

  const handleRefund = async (bookingId: string) => {
      if(confirm('Confirm refund for this booking? Status will change to Refunded.')) {
          await api.processRefund(bookingId);
          // Update local state
          setAllBookings(allBookings.map(b => b.id === bookingId ? { ...b, status: 'refunded' } : b));
      }
  };

  const handleEnquiryStatus = async (id: string, status: 'contacted') => {
      await api.updateEnquiryStatus(id, status);
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status } : e));
  };

  const openAddModal = () => {
    setCurrentTrip({
      title: '',
      slug: '',
      location: '',
      price: 0,
      duration: '',
      rating: 5.0,
      reviewsCount: 0,
      imageUrl: '',
      description: '',
      gallery: [],
      highlights: [],
      inclusions: [],
      exclusions: [],
      pickupPoints: [],
      itinerary: [],
      dates: []
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (trip: Trip) => {
    setCurrentTrip({
        ...trip,
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
            [name]: name === 'price' || name === 'rating' || name === 'reviewsCount' ? Number(value) : value
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'main' | 'gallery') => {
      if (e.target.files && e.target.files[0]) {
          setIsUploading(true);
          try {
              const url = await uploadToCloudinary(e.target.files[0]);
              
              if (target === 'main') {
                  setCurrentTrip(prev => ({ ...prev, imageUrl: url }));
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

  if (authLoading) return <div>Loading...</div>;
  if (!isAdmin) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
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
                        <Users size={20} /> Bookings
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
                </nav>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h1>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                                <p className="text-2xl font-bold text-gray-900">₹{stats.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
                                <p className="text-2xl font-bold text-gray-900">{allBookings.length}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-gray-500 text-sm font-medium">Active Trips</h3>
                                <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
                            </div>
                        </div>
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-6">Booking Analytics</h3>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6"/>
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10}/>
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                                        <Tooltip 
                                            cursor={{fill: '#f9fafb'}}
                                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        />
                                        <Bar dataKey="bookings" fill="#6f3289" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'bookings' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                           <h3 className="text-lg font-bold">Bookings</h3>
                        </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Booking ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Trip</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {allBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-mono text-sm text-gray-600">{booking.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{booking.customerName}</div>
                                                <div className="text-xs text-gray-500">{booking.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{booking.tripTitle}</td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">₹{booking.totalPrice.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                                                    ${booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                                                    ${booking.status === 'refunded' ? 'bg-gray-100 text-gray-600' : ''}
                                                `}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {booking.status === 'cancelled' && (
                                                    <button onClick={() => handleRefund(booking.id)} className="text-brand-orange hover:bg-orange-50 px-3 py-1 rounded text-sm font-medium border border-orange-200">Refund</button>
                                                )}
                                                {booking.status === 'confirmed' && <span className="text-green-600 text-sm flex items-center justify-end gap-1"><CheckCircle size={16}/> Paid</span>}
                                                {booking.status === 'refunded' && <span className="text-gray-400 text-sm flex items-center justify-end gap-1"><RefreshCcw size={16}/> Refunded</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Message</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {enquiries.map((enquiry) => (
                                        <tr key={enquiry.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(enquiry.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4"><div className="font-medium text-gray-900">{enquiry.name}</div></td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1"><Mail size={12}/> {enquiry.email}</div>
                                                <div className="flex items-center gap-1 mt-1"><Phone size={12}/> {enquiry.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={enquiry.message}>{enquiry.message}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${enquiry.status === 'new' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{enquiry.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {enquiry.status === 'new' && <button onClick={() => handleEnquiryStatus(enquiry.id, 'contacted')} className="text-brand-purple hover:bg-purple-50 px-3 py-1 rounded text-sm font-medium border border-purple-200">Mark Contacted</button>}
                                                {enquiry.status === 'contacted' && <span className="text-green-600 text-sm flex items-center justify-end gap-1"><CheckCircle size={16}/> Done</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'trips' && (
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
                                        <th className="px-6 py-4">Duration</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {trips.map((trip) => (
                                        <tr key={trip.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={trip.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                                    <div>
                                                        <span className="font-medium text-gray-900 line-clamp-1">{trip.title}</span>
                                                        <span className="text-xs text-gray-400 block mt-0.5">
                                                            {trip.slug && <span className="flex items-center gap-1"><LinkIcon size={10}/> {trip.slug}</span>}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{trip.location}</td>
                                            <td className="px-6 py-4 text-gray-900 font-medium text-sm">₹{trip.price.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">{trip.duration}</td>
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
                  </div>
              </div>

              {/* Section 2: Media & Description (UPDATED FOR IMAGE UPLOAD) */}
              <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b pb-2">Media & Details</h4>
                  
                  {/* Main Image Upload */}
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Main Image</label>
                      <div className="flex gap-4 items-start">
                          {currentTrip.imageUrl && (
                              <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                                  <img src={currentTrip.imageUrl} alt="Main" className="w-full h-full object-cover" />
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
                                      {isUploading ? <Loader className="animate-spin" size={16}/> : <Upload size={16} />} 
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
                              <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP. Max size: 5MB.</p>
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
                              {isUploading ? <Loader className="animate-spin" size={20}/> : <Plus size={24} />}
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
    </div>
  );
};

export default Admin;