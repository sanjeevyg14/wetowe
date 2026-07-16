import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Check, X, Shield, Minus, Plus, ChevronLeft, ChevronRight, ArrowRight, Bus, Map as MapIcon, Info, Camera, Calendar, User as UserIcon, Download, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { Trip } from '../types';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import { downloadItineraryPDF } from '../utils/pdfUtils';

const TripDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [trip, setTrip] = useState<Trip | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Booking State
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedPickupPoint, setSelectedPickupPoint] = useState<string | null>(null);
    const [maleTravelers, setMaleTravelers] = useState(0);
    const [femaleTravelers, setFemaleTravelers] = useState(0);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingStep, setBookingStep] = useState<'form' | 'processing'>('form');
    const [bookingData, setBookingData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Availability State
    const [availability, setAvailability] = useState({ totalBooked: 0, remaining: 12, remainingMale: 6, remainingFemale: 6, isSoldOut: false });
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
    const [enquiryMsg, setEnquiryMsg] = useState('');

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Share / Download State
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle');
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    useEffect(() => {
        if (id) {
            api.getTripById(id).then(data => {
                setTrip(data);
                if (data && data.dates.length > 0) {
                    setSelectedDate(data.dates[0]);
                }
                setLoading(false);
            });
        }
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (isAuthenticated && user) {
            setBookingData(prev => ({
                ...prev,
                name: user.name,
                email: user.email
            }));
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (trip && selectedDate) {
            setCheckingAvailability(true);
            api.checkAvailability(trip.id, selectedDate).then(data => {
                setAvailability(data);
                setCheckingAvailability(false);
            });
        }
    }, [trip, selectedDate]);

    const handleTravelerChange = (gender: 'male' | 'female', op: 'inc' | 'dec') => {
        if (gender === 'male') {
            if (op === 'dec' && maleTravelers > 0) setMaleTravelers(maleTravelers - 1);
            if (op === 'inc' && (maleTravelers + femaleTravelers) < 20 && maleTravelers < (availability.remainingMale || 6)) setMaleTravelers(maleTravelers + 1);
        } else {
            if (op === 'dec' && femaleTravelers > 0) setFemaleTravelers(femaleTravelers - 1);
            if (op === 'inc' && (maleTravelers + femaleTravelers) < 20 && femaleTravelers < (availability.remainingFemale || 6)) setFemaleTravelers(femaleTravelers + 1);
        }
    };

    const handleShare = async () => {
        const url = `https://wheelstowilderness.in/trip/${id}`;
        const shareData = {
            title: trip?.title ?? 'Check out this trip!',
            text: `🏕️ ${trip?.title} – ${trip?.location}\n${trip?.description?.substring(0, 120)}...`,
            url,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                setShareStatus('shared');
            } else {
                await navigator.clipboard.writeText(url);
                setShareStatus('copied');
            }
        } catch {
            // user cancelled or clipboard blocked – silent fail
        }
        setTimeout(() => setShareStatus('idle'), 2500);
    };

    const handleDownloadItinerary = async () => {
        if (!trip || downloadingPDF) return;
        setDownloadingPDF(true);
        try {
            await downloadItineraryPDF(trip);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert(`Could not generate PDF: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
        } finally {
            setDownloadingPDF(false);
        }
    };

    const initiateBooking = () => {
        setBookingStep('form');
        setIsBookingModalOpen(true);
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trip || !selectedDate) return;

        // Require a pickup point if the trip defines any
        if (trip.pickupPoints && trip.pickupPoints.length > 0 && !selectedPickupPoint) {
            alert('Please select a boarding / pickup point before proceeding.');
            return;
        }

        setBookingStep('processing');

        try {
            const result = await api.createBooking({
                userId: user?.id || 'guest',
                tripId: trip.id,
                tripTitle: trip.title,
                tripImage: trip.imageUrl,
                customerName: bookingData.name,
                email: bookingData.email,
                phone: bookingData.phone,
                date: selectedDate,
                maleTravelers,
                femaleTravelers,
                pickupPoint: selectedPickupPoint || undefined,
                totalPrice: totalPrice
            });

            setIsBookingModalOpen(false);
            navigate('/booking-confirmation', {
                state: {
                    booking: result,
                    tripTitle: trip.title
                }
            });
        } catch (error) {
            console.error("Booking failed", error);
            setBookingStep('form');
            alert("Something went wrong. Please try again.");
        }
    };

    const handleEnquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnquiryStatus('submitting');
        if (!trip || !selectedDate) {
            alert("Cannot submit enquiry: trip data is missing.");
            setEnquiryStatus('idle');
            return;
        }
        try {
            await api.submitEnquiry({
                name: bookingData.name || (user?.name ?? 'Guest'),
                email: bookingData.email || (user?.email ?? ''),
                phone: bookingData.phone || '',
                where: trip.location,
                maleTravelers,
                femaleTravelers,
                traveldate: selectedDate,
                message: `Waiting List Enquiry for ${trip.title} on ${selectedDate}. ${enquiryMsg}`
            });
            setEnquiryStatus('success');
        } catch (error) {
            console.error(error);
            alert('Failed to submit enquiry');
            setEnquiryStatus('idle');
        }
    };


    const galleryImages = trip ? (trip.gallery && trip.gallery.length > 0 ? trip.gallery : [trip.imageUrl]) : [];

    const openLightbox = (index: number) => {
        if (index < galleryImages.length) {
            setCurrentImageIndex(index);
            setLightboxOpen(true);
        }
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-beige flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-sage"></div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen bg-brand-beige flex flex-col">
                <Navbar />
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-brand-black">Trip not found</h2>
                        <Link to="/destinations" className="mt-4 inline-block text-brand-sage hover:underline font-bold">Browse all trips</Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const totalTravelers = maleTravelers + femaleTravelers;
    const basePrice = trip.price * totalTravelers;
    const gstRate = trip.gstPercentage ?? 5;
    const gstAmount = Math.round(basePrice * gstRate / 100);
    const totalPrice = basePrice + gstAmount;

    return (
        <div className="min-h-screen bg-brand-beige font-sans relative text-brand-black">
            <SEO
                title={trip.title}
                description={trip.description.substring(0, 160)}
                image={trip.imageUrl}
                url={`/trip/${id}`}
                keywords={`${trip.title}, ${trip.location}, travel, adventure trip, weekend getaway`}
                structuredData={{
                    '@context': 'https://schema.org',
                    '@type': 'TouristTrip',
                    name: trip.title,
                    description: trip.description.substring(0, 300),
                    image: trip.imageUrl,
                    touristType: 'Adventure Travelers',
                    offers: {
                        '@type': 'Offer',
                        price: trip.price,
                        priceCurrency: 'INR',
                        availability: 'https://schema.org/InStock',
                        url: `https://wheelstowilderness.in/trip/${id}`
                    },
                    itinerary: {
                        '@type': 'ItemList',
                        numberOfItems: parseInt(trip.duration) || 2,
                        itemListElement: [{
                            '@type': 'ListItem',
                            position: 1,
                            name: trip.location
                        }]
                    },
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: trip.rating,
                        reviewCount: trip.reviewsCount || 10,
                        bestRating: 5,
                        worstRating: 1
                    }
                }}
            />
            <Navbar />

            {/* Hero Header - Immersive & Distinct */}
            <div className="w-full bg-brand-cream md:p-8 lg:p-12">
                <div className="relative h-[65vh] md:h-auto md:aspect-[16/9] w-full max-w-7xl mx-auto overflow-hidden md:rounded-3xl shadow-xl">
                <img
                    src={trip.imageUrl}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-transparent to-black/20"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-brand-olive text-brand-cream px-3 py-1 text-xs font-bold uppercase tracking-widest border border-brand-cream/20">Expedition</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-brand-olive font-serif leading-none mb-4 max-w-4xl drop-shadow-lg">
                            {trip.title}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-brand-olive/80 text-sm font-medium tracking-wide">
                            <span className="flex items-center gap-2"><MapPin size={18} className="text-brand-olive" /> {trip.location}</span>
                            <span className="flex items-center gap-2"><Clock size={18} className="text-brand-olive" /> {trip.duration}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 mt-5">
                            <button
                                id="btn-download-itinerary"
                                onClick={handleDownloadItinerary}
                                disabled={downloadingPDF}
                                className="flex items-center gap-2 bg-brand-olive text-brand-black font-bold text-xs px-5 py-2.5 uppercase tracking-widest hover:bg-brand-beige transition disabled:opacity-60 disabled:cursor-not-allowed rounded-sm shadow-lg"
                            >
                                {downloadingPDF
                                    ? <><span className="w-3.5 h-3.5 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin"></span> Generating…</>
                                    : <><Download size={14} /> Download Itinerary</>}
                            </button>

                            <button
                                id="btn-share-trip"
                                onClick={handleShare}
                                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-brand-olive/50 text-brand-olive font-bold text-xs px-5 py-2.5 uppercase tracking-widest hover:bg-white/25 transition rounded-sm"
                            >
                                <Share2 size={14} />
                                {shareStatus === 'copied' ? 'Link Copied!' : shareStatus === 'shared' ? 'Shared!' : 'Share Trip'}
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Left Content Column - Journal Style */}
                    <div className="lg:w-2/3 space-y-16">

                        {/* Description - The "Dispatch" */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px bg-brand-black/20 flex-grow"></div>
                                <h2 className="text-2xl font-bold font-serif uppercase tracking-widest text-brand-cream">The Dispatch</h2>
                                <div className="h-px bg-brand-black/20 flex-grow"></div>
                            </div>
                            <p className="text-lg leading-loose font-light text-brand-black/90">
                                {trip.description}
                            </p>

                            <div className="mt-8 grid grid-cols-2 gap-4">
                                {trip.highlights && trip.highlights.map((h, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-brand-beige/50 border border-brand-olive/10 rounded-sm">
                                        <Check size={16} className="text-brand-sage mt-1 shrink-0" />
                                        <span className="text-sm font-medium">{h}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Pickup Points - NEW FEATURE - Visual Timeline */}
                        {trip.pickupPoints && trip.pickupPoints.length > 0 && (
                            <section className="bg-brand-black text-brand-olive p-8 rounded-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Bus size={120} />
                                </div>
                                <h3 className="text-xl font-bold font-serif mb-8 flex items-center gap-2">
                                    <MapIcon size={20} className="text-brand-olive" /> Rendezvous Points
                                </h3>

                                <div className="relative border-l-2 border-brand-olive/50 ml-3 space-y-8">
                                    {trip.pickupPoints.map((point, index) => (
                                        <div key={index} className="relative pl-8">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-black border-2 border-brand-olive"></div>
                                            <h4 className="font-bold text-lg text-brand-olive">{point}</h4>
                                            <p className="text-xs text-brand-olive/50 uppercase tracking-widest mt-1">Pickup Location {index + 1}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-4 border-t border-brand-olive/10 text-xs text-brand-olive/60 flex items-center gap-2">
                                    <Info size={14} /> Please arrive 15 minutes before scheduled time.
                                </div>
                            </section>
                        )}

                        {/* Itinerary - Accordion/List Style */}
                        <section>
                            <h3 className="text-2xl font-bold font-serif mb-6 text-brand-black border-l-4 border-brand-olive pl-4">Expedition Route</h3>
                            <div className="space-y-6">
                                {trip.itinerary && trip.itinerary.map((day, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex items-baseline gap-4 mb-2">
                                            <span className="text-4xl font-black text-brand-sage group-hover:text-brand-sage/80 transition">0{day.day}</span>
                                            <h4 className="text-xl font-bold text-brand-black">{day.title}</h4>
                                        </div>
                                        <div className="ml-12 border-l border-dashed border-brand-black/20 pl-6 pb-2">
                                            <ul className="space-y-2">
                                                {day.activities.map((act, i) => (
                                                    <li key={i} className="text-brand-black/70 flex items-start gap-2 text-sm">
                                                        <div className="w-1.5 h-1.5 bg-brand-sage rounded-full mt-1.5 shrink-0"></div>
                                                        {act}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Photo Gallery Grid */}
                        {galleryImages.length > 0 && (
                            <section>
                                <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-2">
                                    <Camera size={20} className="text-brand-sage" /> Field Photos
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {galleryImages.map((img, idx) => (
                                        <div key={idx} className="aspect-square relative group overflow-hidden cursor-pointer" onClick={() => openLightbox(idx)}>
                                            <img src={img} className="w-full h-full object-cover transition duration-500 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0" alt={`Gallery ${idx}`} />
                                            <div className="absolute inset-0 bg-brand-olive/20 opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Inclusions/Exclusions - Brutalist Table */}
                        <section className="border border-brand-black/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-brand-black/10">
                                <div className="p-6">
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-brand-sage mb-4">Included</h4>
                                    <ul className="space-y-2">
                                        {trip.inclusions && trip.inclusions.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-brand-black/80">
                                                <Check size={14} className="text-brand-sage mt-1 shrink-0" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 bg-brand-black/5">
                                    <h4 className="font-bold text-sm uppercase tracking-widest text-brand-black/50 mb-4">Not Included</h4>
                                    <ul className="space-y-2">
                                        {trip.exclusions && trip.exclusions.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-brand-black/60">
                                                <X size={14} className="text-red-400 mt-1 shrink-0" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* Right Sidebar - "The Ticket" Aesthetic */}
                    <div className="lg:w-1/3 relative">
                        <div className="sticky top-24">
                            {/* The Ticket Card */}
                            <div className="bg-brand-black text-brand-olive rounded-sm shadow-2xl overflow-hidden relative border-4 border-double border-brand-olive/30">
                                {/* Decorative 'Hole Punch' Circles */}
                                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-brand-beige rounded-full"></div>
                                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-brand-beige rounded-full"></div>
                                <div className="absolute left-0 top-1/2 w-full border-t-2 border-dashed border-brand-olive/10"></div>

                                <div className="p-6 pb-8">
                                    <h3 className="text-center font-serif text-2xl font-bold mb-1 tracking-wider text-brand-olive">ADMIT ONE</h3>
                                    <p className="text-center text-xs text-brand-olive/50 uppercase tracking-widest mb-6">Wheel to Wilderness Expedition</p>

                                    <div className="flex justify-between items-end mb-6">
                                        <div>
                                            <p className="text-xs text-brand-olive/60 uppercase">Base price ({totalTravelers} × ₹{trip.price.toLocaleString()})</p>
                                            <p className="text-3xl font-bold font-mono text-brand-olive">₹{basePrice.toLocaleString()}</p>
                                            {gstRate > 0 && (
                                                <p className="text-xs text-brand-olive/60 mt-1">
                                                    + GST ({gstRate}%) <span className="font-mono">₹{gstAmount.toLocaleString()}</span>
                                                    &nbsp;= <span className="font-mono font-bold text-brand-olive">₹{totalPrice.toLocaleString()}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div className={`px-2 py-1 flex flex-col gap-1 items-end text-xs font-bold uppercase`}>
                                            {availability.isSoldOut ? (
                                                <span className="border border-red-500 text-red-500 px-2 py-1">Sold Out</span>
                                            ) : (
                                                <>
                                                    <span className="border border-brand-olive text-brand-olive px-2 py-1">M: {availability.remainingMale || 0} Left</span>
                                                    <span className="border border-brand-olive text-brand-olive px-2 py-1">F: {availability.remainingFemale || 0} Left</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive/60 mb-2">Select Date</label>
                                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-brand-olive scrollbar-track-brand-black">
                                                {trip.dates && trip.dates.map((date, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => setSelectedDate(date)}
                                                        className={`p-3 border cursor-pointer transition flex items-center justify-between
                                                    ${selectedDate === date
                                                                ? 'border-brand-olive bg-brand-olive/20 text-brand-olive'
                                                                : 'border-brand-olive/20 text-brand-olive/60 hover:border-brand-olive/40'}
                                                `}
                                                    >
                                                        <span className="text-sm font-mono font-bold">{date}</span>
                                                        {selectedDate === date && <Check size={14} className="text-brand-olive" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {!availability.isSoldOut && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive/60 mb-2">
                                                        Male Travellers (Available: {availability.remainingMale || 0})
                                                    </label>
                                                    <div className="flex items-center justify-between border border-brand-olive/20 p-2">
                                                        <button onClick={() => handleTravelerChange('male', 'dec')} className="p-1 hover:text-brand-olive disabled:opacity-30" disabled={maleTravelers <= 0}>
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="font-mono text-lg font-bold">{maleTravelers}</span>
                                                        <button onClick={() => handleTravelerChange('male', 'inc')} className="p-1 hover:text-brand-olive disabled:opacity-30" disabled={(maleTravelers + femaleTravelers) >= 20 || maleTravelers >= (availability.remainingMale || 6)}>
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive/60 mb-2">
                                                        Female Travellers (Available: {availability.remainingFemale || 0})
                                                    </label>
                                                    <div className="flex items-center justify-between border border-brand-olive/20 p-2">
                                                        <button onClick={() => handleTravelerChange('female', 'dec')} className="p-1 hover:text-brand-olive disabled:opacity-30" disabled={femaleTravelers <= 0}>
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="font-mono text-lg font-bold">{femaleTravelers}</span>
                                                        <button onClick={() => handleTravelerChange('female', 'inc')} className="p-1 hover:text-brand-olive disabled:opacity-30" disabled={(maleTravelers + femaleTravelers) >= 20 || femaleTravelers >= (availability.remainingFemale || 6)}>
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pickup / Boarding Point Selector */}
                                        {!availability.isSoldOut && trip.pickupPoints && trip.pickupPoints.length > 0 && (
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-brand-olive/60 mb-2">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> Boarding Point</span>
                                                </label>
                                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-brand-olive scrollbar-track-brand-black">
                                                    {trip.pickupPoints.map((point, idx) => (
                                                        <div
                                                            key={idx}
                                                            onClick={() => setSelectedPickupPoint(point)}
                                                            className={`p-3 border cursor-pointer transition flex items-center justify-between
                                                            ${selectedPickupPoint === point
                                                                ? 'border-brand-olive bg-brand-olive/20 text-brand-olive'
                                                                : 'border-brand-olive/20 text-brand-olive/60 hover:border-brand-olive/40'}
                                                            `}
                                                        >
                                                            <span className="text-sm font-bold">{point}</span>
                                                            {selectedPickupPoint === point && <Check size={14} className="text-brand-olive shrink-0 ml-2" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 bg-brand-black/50 relative z-10">
                                    {availability.isSoldOut ? (
                                        <form onSubmit={handleEnquirySubmit} className="space-y-3">
                                            <p className="text-xs text-brand-olive/70 text-center mb-2">Join the waitlist for this batch.</p>
                                            <input
                                                type="text"
                                                placeholder="Email Address"
                                                className="w-full bg-transparent border border-brand-olive/30 p-2 text-sm text-brand-olive focus:border-brand-olive focus:outline-none placeholder-brand-olive/40"
                                                value={bookingData.email}
                                                onChange={e => setBookingData({ ...bookingData, email: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="submit"
                                                disabled={enquiryStatus === 'submitting'}
                                                className="w-full bg-brand-olive text-brand-black font-bold py-3 uppercase tracking-widest text-xs hover:bg-brand-beige hover:text-brand-black transition"
                                            >
                                                {enquiryStatus === 'submitting' ? 'Processing...' : 'Notify Me'}
                                            </button>
                                        </form>
                                    ) : (
                                        <>
                                            <button
                                                onClick={initiateBooking}
                                                disabled={!selectedDate || checkingAvailability || (trip.pickupPoints && trip.pickupPoints.length > 0 && !selectedPickupPoint)}
                                                className="w-full bg-brand-olive text-brand-black font-bold py-4 uppercase tracking-widest text-sm hover:bg-brand-beige hover:text-brand-black transition border border-transparent hover:border-brand-olive disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {checkingAvailability ? "Checking..." : "Secure Spot"}
                                                <ArrowRight size={16} />
                                            </button>
                                        </>
                                    )}
                                    <div className="mt-4 text-center">
                                        <span className="text-[10px] text-brand-olive/40 flex items-center justify-center gap-1">
                                            <Shield size={10} /> No online payment required
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help? Box */}
                            <div className="mt-6 border border-brand-black/10 p-4 text-center bg-brand-beige">
                                <p className="font-bold text-sm text-brand-black mb-1">Questions?</p>
                                <p className="text-xs text-brand-black/60 mb-2">Our expedition leaders are here.</p>
                                <a href="tel:+919606499422" className="text-brand-sage font-bold text-sm hover:underline">
                                    +91 96064 99422
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Enhanced Booking Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-black/95 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-lg bg-brand-beige rounded-xl shadow-2xl overflow-hidden relative border border-brand-olive/30">

                        <button
                            onClick={() => setIsBookingModalOpen(false)}
                            className="absolute top-4 right-4 text-brand-black/40 hover:text-brand-black z-20"
                        >
                            <X size={24} />
                        </button>

                        {/* Step 1: Form */}
                        {bookingStep === 'form' && (
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-black/10">
                                    <div className="bg-brand-olive text-brand-cream p-2 rounded-lg">
                                        <Bus size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-brand-black font-serif">Booking Enquiry Form</h2>
                                        <p className="text-brand-black/50 text-xs uppercase tracking-widest">Passenger Details</p>
                                    </div>
                                </div>

                                <div className="bg-white p-4 mb-6 flex gap-4 items-center border border-brand-black/5 rounded-lg shadow-sm">
                                    <img src={trip.imageUrl} alt="Thumb" className="w-16 h-16 object-cover rounded-md grayscale" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-brand-black text-sm line-clamp-1">{trip.title}</h4>
                                        <div className="text-xs text-brand-black/50 mt-1 font-mono flex items-center gap-2">
                                            <Calendar size={12} /> {selectedDate}
                                        </div>
                                        {selectedPickupPoint && (
                                            <div className="text-xs text-brand-black/50 mt-1 flex items-center gap-2">
                                                <MapPin size={12} className="text-brand-sage shrink-0" /> {selectedPickupPoint}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <form onSubmit={handleBookingSubmit} className="space-y-5">
                                    {/* Inputs */}
                                    <div>
                                        <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Passenger Name</label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="text" required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-sage bg-white rounded-lg transition"
                                                value={bookingData.name}
                                                onChange={e => setBookingData({ ...bookingData, name: e.target.value })}
                                                placeholder="Full Name as on ID"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Email</label>
                                            <input
                                                type="email" required
                                                className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-sage bg-white rounded-lg transition"
                                                value={bookingData.email}
                                                onChange={e => setBookingData({ ...bookingData, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Phone</label>
                                            <input
                                                type="tel" required
                                                className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-brand-sage bg-white rounded-lg transition"
                                                value={bookingData.phone}
                                                onChange={e => setBookingData({ ...bookingData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-brand-olive/5 p-4 rounded-lg border border-brand-olive/10 space-y-1">
                                        {selectedPickupPoint && (
                                            <div className="flex justify-between items-center text-sm text-brand-black/70 pb-2 mb-1 border-b border-brand-olive/10">
                                                <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-sage" /> Boarding Point</span>
                                                <span className="font-semibold text-brand-black text-right max-w-[55%] leading-tight">{selectedPickupPoint}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center text-sm text-brand-black/70">
                                            <span>Base price ({totalTravelers} × ₹{trip.price.toLocaleString()})</span>
                                            <span className="font-mono">₹{basePrice.toLocaleString()}</span>
                                        </div>
                                        {gstRate > 0 && (
                                            <div className="flex justify-between items-center text-sm text-brand-black/70">
                                                <span>GST ({gstRate}%)</span>
                                                <span className="font-mono">₹{gstAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2 border-t border-brand-olive/20">
                                            <span className="font-bold text-brand-cream">Estimated Amount</span>
                                            <span className="text-xl font-bold font-mono text-brand-black">₹{totalPrice.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button type="submit" className="w-full bg-brand-cream text-brand-olive font-bold py-4 hover:bg-brand-black hover:text-brand-olive transition mt-4 flex items-center justify-center gap-2 uppercase tracking-wide text-sm rounded-lg shadow-lg">
                                        Submit Booking Enquiry <ArrowRight size={16} />
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* Step 2: Processing */}
                        {bookingStep === 'processing' && (
                            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                                <div className="w-20 h-20 border-4 border-gray-200 border-t-brand-olive rounded-full animate-spin mb-8"></div>
                                <h3 className="text-2xl font-bold text-brand-black mb-2 font-serif">Submitting Booking Enquiry...</h3>
                                <p className="text-brand-black/50">Please wait while we save your details.</p>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[60] bg-brand-black/95 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeLightbox}>
                    <button className="absolute top-4 right-4 text-brand-olive hover:text-gray-300 z-50 p-2" onClick={closeLightbox}>
                        <X size={32} />
                    </button>

                    <button className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-olive hover:text-gray-300 p-2 bg-white/10 rounded-full hover:bg-white/20 transition" onClick={prevImage}>
                        <ChevronLeft size={40} />
                    </button>

                    <img
                        src={galleryImages[currentImageIndex]}
                        alt="Full screen"
                        className="max-h-[85vh] max-w-[90vw] object-contain border-8 border-brand-beige/30 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-olive hover:text-gray-300 p-2 bg-white/10 rounded-full hover:bg-white/20 transition" onClick={nextImage}>
                        <ChevronRight size={40} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-brand-black text-xs font-bold bg-brand-beige px-4 py-1 uppercase tracking-widest">
                        {currentImageIndex + 1} / {galleryImages.length}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default TripDetails;