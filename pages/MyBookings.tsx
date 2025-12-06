import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Booking } from '../types';
import { Navigate, Link } from 'react-router-dom';
import { Calendar, Users, Clock, ArrowRight, Ban, Download, Ticket, Plane, History, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

const MyBookings: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'cancelled'>('active');

  useEffect(() => {
    if (user) {
        api.getBookingsByUser(user.id).then(data => {
            // Sort by most recent
            setBookings(data.sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()));
            setIsLoadingBookings(false);
        });
    }
  }, [user]);

  const handleCancel = async (bookingId: string) => {
      if (window.confirm("Are you sure you want to cancel this booking? Refunds are processed within 3-5 business days.")) {
          await api.cancelBooking(bookingId);
          setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      }
  };

  const handleDownloadTicket = (booking: Booking) => {
      const ticketWindow = window.open('', '_blank');
      if (ticketWindow) {
          ticketWindow.document.write(`
            <html>
              <head>
                <title>Ticket - ${booking.id}</title>
                <style>
                  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background: #f9fafb; }
                  .ticket { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
                  .header { background: #3A4D39; color: white; padding: 30px; text-align: center; }
                  .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
                  .header p { margin: 5px 0 0; opacity: 0.8; font-size: 14px; }
                  .content { padding: 30px; }
                  .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 15px; }
                  .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
                  .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
                  .value { font-weight: bold; color: #111827; font-size: 16px; }
                  .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
                  .status { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; background: #dcfce7; color: #166534; }
                  @media print {
                      body { background: white; padding: 0; }
                      .ticket { box-shadow: none; border: 2px solid #000; }
                  }
                </style>
              </head>
              <body>
                <div class="ticket">
                  <div class="header">
                    <h1>Wheel to Wilderness</h1>
                    <p>Expedition Pass</p>
                  </div>
                  <div class="content">
                    <div class="row">
                        <div>
                            <div class="label">Booking Ref</div>
                            <div class="value">#${booking.id.slice(-6).toUpperCase()}</div>
                        </div>
                        <div>
                             <span class="status">CONFIRMED</span>
                        </div>
                    </div>
                    <div class="row">
                        <div style="width: 100%">
                            <div class="label">Expedition</div>
                            <div class="value">${booking.tripTitle}</div>
                        </div>
                    </div>
                    <div class="row">
                        <div>
                            <div class="label">Explorer</div>
                            <div class="value">${booking.customerName}</div>
                        </div>
                        <div style="text-align: right">
                            <div class="label">Date</div>
                            <div class="value">${booking.date}</div>
                        </div>
                    </div>
                    <div class="row">
                        <div>
                            <div class="label">Crew Size</div>
                            <div class="value">${booking.travelers} Person(s)</div>
                        </div>
                        <div style="text-align: right">
                            <div class="label">Total Paid</div>
                            <div class="value" style="color: #3A4D39">₹${booking.totalPrice.toLocaleString()}</div>
                        </div>
                    </div>
                  </div>
                  <div class="footer">
                    <p>Present this pass at the rendezvous point.</p>
                    <p>Emergency Contact: +91 98765 43210</p>
                  </div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
              </body>
            </html>
          `);
          ticketWindow.document.close();
      }
  };

  if (loading) return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-olive"></div>
    </div>
  );
  
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  const filteredBookings = bookings.filter(b => {
      if (activeTab === 'active') return ['confirmed', 'pending'].includes(b.status);
      if (activeTab === 'cancelled') return ['cancelled', 'refunded'].includes(b.status);
      return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-brand-olive text-brand-cream pt-12 pb-24 px-4 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           <div className="max-w-5xl mx-auto relative z-10">
               <h1 className="text-4xl md:text-5xl font-black font-serif mb-4">My Journeys</h1>
               <p className="text-brand-cream/70 text-lg max-w-2xl">
                   "Travel is the only thing you buy that makes you richer." <br/>
                   Here is a log of your upcoming adventures and past expeditions.
               </p>
           </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 -mt-16 flex-grow pb-20 relative z-20">
        
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-xl shadow-lg border border-gray-100 w-fit">
            <button 
                onClick={() => setActiveTab('active')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'active' ? 'bg-brand-olive text-white shadow-md' : 'text-gray-500 hover:text-brand-olive hover:bg-gray-50'}`}
            >
                <Plane size={16} /> Upcoming & Active
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {bookings.filter(b => ['confirmed', 'pending'].includes(b.status)).length}
                </span>
            </button>
            <button 
                onClick={() => setActiveTab('cancelled')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'cancelled' ? 'bg-brand-olive text-white shadow-md' : 'text-gray-500 hover:text-brand-olive hover:bg-gray-50'}`}
            >
                <History size={16} /> History & Cancelled
                <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${activeTab === 'cancelled' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {bookings.filter(b => ['cancelled', 'refunded'].includes(b.status)).length}
                </span>
            </button>
        </div>

        {isLoadingBookings ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-olive"></div>
            </div>
        ) : filteredBookings.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="bg-brand-beige w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Ticket className="text-brand-olive" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">No {activeTab} journeys found</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">The world is vast and waiting for you. Start planning your next great escape today.</p>
                <Link to="/destinations" className="inline-flex items-center gap-2 bg-brand-olive text-white px-8 py-3 rounded-full font-bold hover:bg-brand-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Find an Adventure <ArrowRight size={18}/>
                </Link>
            </div>
        ) : (
            <div className="space-y-8">
                {filteredBookings.map((booking) => (
                    <div key={booking.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl hover:border-brand-olive/20 transition-all duration-300 flex flex-col md:flex-row h-full md:h-64">
                        
                        {/* Visual Side */}
                        <div className="w-full md:w-2/5 relative overflow-hidden h-48 md:h-full">
                            <img src={booking.tripImage} alt={booking.tripTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="text-white font-bold text-xl md:text-2xl font-serif leading-tight mb-1">{booking.tripTitle}</h3>
                                    <p className="text-white/80 text-xs uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={12}/> Trip ID: {booking.id.slice(-6)}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-md
                                    ${booking.status === 'confirmed' ? 'bg-green-500/90 text-white' : 
                                      booking.status === 'pending' ? 'bg-yellow-500/90 text-white' : 
                                      booking.status === 'cancelled' ? 'bg-red-500/90 text-white' : 
                                      'bg-gray-500/90 text-white'}
                                `}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                        
                        {/* Ticket Details Side */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative">
                            {/* Decorative Perforation Line */}
                            <div className="absolute left-0 top-4 bottom-4 w-[1px] border-l-2 border-dashed border-gray-200 hidden md:block"></div>
                            
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Date of Departure</p>
                                    <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
                                        <Calendar size={18} className="text-brand-olive"/> {booking.date}
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Total Paid</p>
                                    <div className="text-2xl font-black text-brand-olive font-mono">₹{booking.totalPrice.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Travelers</p>
                                    <div className="flex items-center gap-2 font-bold text-gray-700">
                                        <Users size={16} className="text-brand-sage"/> {booking.travelers} Person(s)
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Booked On</p>
                                    <div className="flex items-center gap-2 font-bold text-gray-700">
                                        <Clock size={16} className="text-brand-sage"/> {new Date(booking.bookedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-auto">
                                <div className="flex gap-3">
                                    {booking.status === 'confirmed' ? (
                                        <>
                                            <button 
                                                onClick={() => handleDownloadTicket(booking)}
                                                className="flex items-center gap-2 px-4 py-2 bg-brand-olive text-white rounded-lg text-sm font-bold hover:bg-brand-black transition shadow-md"
                                            >
                                                <Download size={16} /> <span className="hidden sm:inline">Ticket</span>
                                            </button>
                                            <button 
                                                onClick={() => handleCancel(booking.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 hover:border-red-200 transition"
                                            >
                                                <Ban size={16} /> <span className="hidden sm:inline">Cancel</span>
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-xs text-gray-400 flex items-center gap-1 italic">
                                            {booking.status === 'cancelled' && <><AlertCircle size={14}/> This booking has been cancelled.</>}
                                        </div>
                                    )}
                                </div>
                                
                                {booking.status === 'confirmed' && (
                                    <div className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase tracking-wider">
                                        <CheckCircle2 size={14} /> Ready to go
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyBookings;