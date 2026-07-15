import React, { useState, useRef, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Star, Filter, ArrowRight, Minus, Plus, ChevronLeft, ChevronRight, Quote, X, Camera, Zap, Trophy, Heart, Map, Mail, Phone, Send, Compass, ArrowUpRight, ShieldCheck, Leaf, Gift, Percent, Tag, Clock, Flame } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TripCard from '../components/TripCard';
import SEO from '../components/SEO';
import { api } from '../services/api';
import { Trip, Testimonial } from '../types';
import { Link, useNavigate } from 'react-router-dom';

// Helper component for scroll animations
const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Helper component for animated statistics
const StatCounter: React.FC<{ end: number; duration?: number; label: string; suffix?: string; icon: React.ReactNode }> = ({ end, duration = 2000, label, suffix = '', icon }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [hasAnimated, end, duration]);

  return (
    <div ref={ref} className="flex flex-col items-center p-8 bg-brand-cream rounded-xl border border-brand-olive/10 hover:border-brand-olive transition-all h-full justify-center text-center group hover:shadow-xl hover:-translate-y-2 duration-500 relative overflow-hidden">
      {/* Background Blob */}
      <div className="absolute top-0 left-0 w-full h-full bg-brand-olive/10 scale-0 group-hover:scale-100 rounded-xl transition-transform duration-500 origin-bottom"></div>

      <div className={`relative z-10 mb-4 text-brand-olive bg-brand-olive/10 p-5 rounded-full transform transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${hasAnimated ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-45 opacity-0'} group-hover:bg-brand-olive group-hover:text-brand-cream group-hover:scale-110`}>
        {icon}
      </div>
      <div className={`relative z-10 transition-all duration-700 delay-300 ease-out ${hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="text-4xl font-extrabold text-brand-olive mb-1 font-serif">
          {count}{suffix}
        </div>
        <div className="text-brand-olive/60 font-bold text-xs uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );
};

// Extracted Trip Carousel component for dynamic categories
const TripCarousel: React.FC<{ category: string, categoryTrips: Trip[], loading: boolean }> = ({ category, categoryTrips, loading }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isTripHovered, setIsTripHovered] = useState(false);
  
  const infiniteTrips = categoryTrips.length > 0 ? [...categoryTrips, ...categoryTrips] : [];
  
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (isTripHovered || loading || categoryTrips.length === 0) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth } = carouselRef.current;
        const maxScroll = scrollWidth / 2;
        if (scrollLeft >= maxScroll) {
          carouselRef.current.scrollTo({ left: scrollLeft - maxScroll, behavior: 'auto' });
          carouselRef.current.scrollBy({ left: 1, behavior: 'smooth' });
        } else {
          carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
        if (carouselRef.current.scrollLeft >= maxScroll) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
        }
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isTripHovered, loading, categoryTrips.length]);

  return (
    <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 border-b border-brand-olive/10 last:border-0"
        onMouseEnter={() => setIsTripHovered(true)}
        onMouseLeave={() => setIsTripHovered(false)}
      >
        <div className="flex items-end justify-between mb-10 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-olive font-serif uppercase tracking-wide">{category}</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollCarousel('left')}
              className="p-3 rounded-md border border-brand-olive/20 hover:bg-brand-olive hover:text-brand-cream transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="p-3 rounded-md border border-brand-olive/20 hover:bg-brand-olive hover:text-brand-cream transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="min-w-[300px] h-[400px] bg-brand-beige rounded-md animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-6 pb-4 no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {infiniteTrips.map((trip, index) => (
              <div key={`${trip.id}-${index}`} className="min-w-[300px] sm:min-w-[350px] h-full flex-shrink-0">
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        )}
      </section>
  );
};

const Home: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeStats, setHomeStats] = useState<any[]>([]);
  const [quickTags, setQuickTags] = useState<string[]>(['Hampi', 'Gokarna', 'Wayanad', 'Pondicherry']);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [travellers, setTravellers] = useState(1);
  const [isTravellerPickerOpen, setIsTravellerPickerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Enquiry Form State
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [enquiryData, setEnquiryData] = useState({ name: '', Travellers: '', phone: '', email: '', traveldate: '', where: '', message: '' });

  // Gallery State
  const [galleryImages, setGalleryImages] = useState<{ imageUrl: string; caption: string }[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Marquee/Ticker State
  const [marqueeItems, setMarqueeItems] = useState<{ _id: string; text: string; icon: string }[]>([]);

  // Hero Carousel State
  const [heroImages, setHeroImages] = useState<{ id: string; imageUrl: string; caption: string }[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);

  // Autoplay pause states
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tripsData, testimonialsData, galleryData, marqueeData, heroData, statsData, tagsData] = await Promise.all([
          api.getTrips(),
          api.getTestimonials(),
          api.getGalleryImages(),
          api.getMarqueeItems(),
          api.getHeroImages(),
          api.getSetting('home_stats').catch(() => ({ value: null })),
          api.getSetting('home_quick_tags').catch(() => ({ value: null }))
        ]);
        setTrips(tripsData);
        setTestimonials(testimonialsData);
        
        if (statsData?.value) setHomeStats(statsData.value);
        else setHomeStats([
          { end: 150, suffix: '+', label: 'Trips Done', iconName: 'Trophy' },
          { end: 5000, suffix: '+', label: 'Travelers', iconName: 'Users' },
          { end: 25, suffix: '+', label: 'Spots', iconName: 'Map' },
          { end: 40, suffix: '%', label: 'Solo Women', iconName: 'Heart' }
        ]);

        if (tagsData?.value) setQuickTags(tagsData.value);
        // Set gallery with fallback to default images
        if (galleryData && galleryData.length > 0) {
          setGalleryImages(galleryData);
        } else {
          // Fallback default images
          setGalleryImages([
            { imageUrl: "https://picsum.photos/id/1015/800/600", caption: "" },
            { imageUrl: "https://picsum.photos/id/1039/800/600", caption: "" },
            { imageUrl: "https://picsum.photos/id/1040/800/600", caption: "" },
            { imageUrl: "https://picsum.photos/id/1050/800/600", caption: "" },
            { imageUrl: "https://picsum.photos/id/106/800/600", caption: "" },
            { imageUrl: "https://picsum.photos/id/1036/800/600", caption: "" }
          ]);
        }
        // Set marquee items
        if (marqueeData && marqueeData.length > 0) {
          setMarqueeItems(marqueeData);
        }
        // Set hero images with fallback
        if (heroData && heroData.length > 0) {
          setHeroImages(heroData);
        } else {
          setHeroImages([
            { id: '1', imageUrl: "https://picsum.photos/id/1039/1200/800", caption: "Hampi Ruins" },
            { id: '2', imageUrl: "https://picsum.photos/id/1015/1200/800", caption: "Gokarna Beach" },
            { id: '3', imageUrl: "https://picsum.photos/id/1040/1200/800", caption: "Wayanad Forest" }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Group trips by category
  const groupedTrips = trips.reduce((acc, trip) => {
    const cat = trip.category || 'Trending Expeditions';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(trip);
    return acc;
  }, {} as Record<string, Trip[]>);

  const durations = ['All', '2 Days', '3 Days', 'Longer'];

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDuration = true;
    if (selectedDuration !== 'All') {
      if (selectedDuration === '2 Days') matchesDuration = trip.duration.includes('2 Days');
      else if (selectedDuration === '3 Days') matchesDuration = trip.duration.includes('3 Days');
      else if (selectedDuration === 'Longer') matchesDuration = parseInt(trip.duration) > 3;
    }

    return matchesSearch && matchesDuration;
  });

  // Gallery images are now fetched from API in useEffect above

  const handleTravellerChange = (operation: 'inc' | 'dec') => {
    if (operation === 'dec' && travellers > 1) setTravellers(travellers - 1);
    if (operation === 'inc' && travellers < 20) setTravellers(travellers + 1);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedDate) params.append('date', selectedDate);
    if (travellers > 1) params.append('travelers', travellers.toString());
    navigate(`/destinations?${params.toString()}`);
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus('submitting');
    try {
      await api.submitEnquiry(enquiryData);
      setEnquiryStatus('success');
      setEnquiryData({ name: '', Travellers: '', phone: '', email: '', traveldate: '', where: '', message: '' });
    } catch (error) {
      console.error(error);
      setEnquiryStatus('error');
    }
  };

  const nextTestimonial = () => {
    if (testimonials.length > 0)
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (testimonials.length > 0)
      setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
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

  // Testimonial Autoplay
  useEffect(() => {
    if (isTestimonialHovered || testimonials.length === 0) return;

    const interval = setInterval(() => {
      setTestimonialIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isTestimonialHovered, testimonials.length]);

  // Hero Carousel Autoplay
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const prevHero = () => setHeroIndex(prev => (prev - 1 + heroImages.length) % heroImages.length);
  const nextHero = () => setHeroIndex(prev => (prev + 1) % heroImages.length);

  // Helper to render marquee icon
  const getMarqueeIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Zap': <Zap size={14} className="text-yellow-400" />,
      'ArrowUpRight': <ArrowUpRight size={14} className="text-brand-cream" />,
      'MapPin': <MapPin size={14} className="text-brand-cream" />,
      'Star': <Star size={14} className="text-yellow-400" />,
      'Gift': <Gift size={14} className="text-pink-300" />,
      'Percent': <Percent size={14} className="text-green-300" />,
      'Tag': <Tag size={14} className="text-brand-cream" />,
      'Clock': <Clock size={14} className="text-orange-300" />,
      'Heart': <Heart size={14} className="text-red-400" />,
      'Flame': <Flame size={14} className="text-orange-400" />
    };
    return iconMap[iconName] || <Zap size={14} className="text-yellow-400" />;
  };

  // Default marquee items as fallback
  const defaultMarqueeItems = [
    { _id: '1', text: 'Flash Sale: 15% OFF Gokarna Trek', icon: 'Zap' },
    { _id: '2', text: 'Hampi Batches Filling Fast', icon: 'ArrowUpRight' },
    { _id: '3', text: 'New Destination: Wayanad', icon: 'MapPin' },
    { _id: '4', text: 'Monsoon Treks Open', icon: 'Zap' },
    { _id: '5', text: 'Early Bird Discounts on Pondicherry', icon: 'ArrowUpRight' }
  ];

  const displayMarqueeItems = marqueeItems.length > 0 ? marqueeItems : defaultMarqueeItems;

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream overflow-x-hidden font-sans">
      <SEO
        title="Home"
        description="Discover handpicked weekend getaways, trekking spots, and hidden gems across India. Book curated travel experiences to Gokarna, Hampi, Pondicherry, Wayanad and more."
        keywords="travel, trips, weekend getaway, trekking, adventure, India travel, group tours, Gokarna, Hampi, Pondicherry, Wayanad"
        url="/"
        image="https://wheelstowilderness.in/og-image.jpg"
      />
      <Navbar />

      {/* Marquee Section - Positioned below Navbar */}
      <div className="bg-brand-olive text-brand-cream py-2.5 overflow-hidden relative z-40 border-b border-white/10 shadow-sm">
        <div className="whitespace-nowrap animate-marquee flex gap-16 items-center uppercase text-[10px] md:text-xs font-bold tracking-[0.2em]">
          {/* First set of items */}
          {displayMarqueeItems.map((item) => (
            <span key={item._id} className="flex items-center gap-2">
              {getMarqueeIcon(item.icon)} {item.text}
            </span>
          ))}
          {/* Duplicate for smooth loop */}
          {displayMarqueeItems.map((item) => (
            <span key={`dup-${item._id}`} className="flex items-center gap-2">
              {getMarqueeIcon(item.icon)} {item.text}
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section - Redesigned Split Layout */}
      <section className="relative w-full overflow-hidden bg-brand-cream pt-8 lg:pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Left: Text & Search - Now fills height and centers content */}
            <div className="lg:w-1/2 z-10 animate-fade-in-up flex flex-col justify-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-olive/20 text-brand-olive text-xs font-bold uppercase tracking-widest mb-6 border border-brand-olive/30 self-start">
                <Compass size={14} />
                <span>Explore the Unseen</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-black font-serif text-brand-olive leading-tight mb-6">
                Let's Get <br />
                <span className="text-brand-beige italic">Lost</span> Together.
              </h1>

              <p className="text-lg text-brand-olive/70 mb-8 max-w-md leading-relaxed">
                Discover handpicked weekend gateways, trekking spots, and hidden gems across India.
              </p>

              {/* Search Bar - Redesigned */}
              <div className="bg-white p-2 rounded-2xl shadow-xl border border-brand-olive/10 max-w-2xl relative z-30">
                <div className="flex flex-col md:flex-row gap-2">
                  {/* Location */}
                  <div className="flex-[1.5] relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream" size={20} />
                    <input
                      type="text"
                      placeholder="Where to?"
                      className="w-full h-full bg-gray-50 hover:bg-gray-100 transition rounded-xl py-3 pl-12 pr-4 outline-none text-brand-black font-medium placeholder:text-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Date */}
                  <div className="flex-1 relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream" size={20} />
                    <input
                      type="date"
                      className="w-full h-full bg-gray-50 hover:bg-gray-100 transition rounded-xl py-3 pl-12 pr-4 outline-none text-brand-black font-medium text-sm uppercase"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  {/* Travellers */}
                  <div className="flex-1 relative group">
                    <div
                      onClick={() => setIsTravellerPickerOpen(!isTravellerPickerOpen)}
                      className="w-full h-full bg-gray-50 hover:bg-gray-100 transition rounded-xl py-3 pl-12 pr-4 outline-none text-gray-900 font-bold cursor-pointer flex items-center select-none"
                    >
                      <span className="text-sm truncate">
                        {travellers} Traveler{travellers !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream" size={20} />

                    {/* Dropdown */}
                    {isTravellerPickerOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsTravellerPickerOpen(false)}></div>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 animate-fade-in-up">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Guests</span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTravellerChange('dec'); }}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-brand-black hover:bg-brand-cream hover:text-brand-olive transition disabled:opacity-50"
                                disabled={travellers <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold w-4 text-center">{travellers}</span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleTravellerChange('inc'); }}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-brand-black hover:bg-brand-cream hover:text-brand-olive transition"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleSearch}
                    className="bg-brand-cream text-brand-olive p-4 rounded-xl hover:bg-brand-black hover:text-brand-olive transition shadow-lg flex items-center justify-center"
                  >
                    <Search size={24} />
                  </button>
                </div>

                {/* Quick Tags underneath */}
                <div className="mt-3 flex gap-2 px-2 overflow-x-auto no-scrollbar">
                  {quickTags.map(tag => (
                    <button key={tag} onClick={() => setSearchTerm(tag)} className="text-[10px] font-bold uppercase tracking-wider text-brand-black/40 hover:text-brand-olive transition border border-brand-black/10 px-2 py-1 rounded-md whitespace-nowrap bg-gray-50">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Hero Carousel - Square Images */}
            <div className="lg:w-1/2 relative animate-fade-in-up animate-delay-200">
              {/* Image dimensions guide: 1200×800px (3:2 ratio) recommended for best quality */}
              <div className="relative w-full aspect-[3/2] overflow-hidden shadow-2xl rounded-sm group">
                {heroImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.caption || `Hero ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Overlay Content */}
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      {heroImages[heroIndex]?.caption && (
                        <p className="font-bold text-lg font-serif">{heroImages[heroIndex].caption}</p>
                      )}
                      <p className="text-xs uppercase tracking-widest opacity-70 mt-1">Next Expedition</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={prevHero} className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 hover:bg-brand-cream hover:text-brand-black transition">
                        <ChevronLeft size={18} className="text-white" />
                      </button>
                      <button onClick={nextHero} className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 hover:bg-brand-cream hover:text-brand-black transition">
                        <ChevronRight size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                  {/* Dot indicators */}
                  <div className="flex gap-1.5 mt-3">
                    {heroImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setHeroIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === heroIndex ? 'bg-white w-6' : 'bg-white/40 w-1.5'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-4 -left-12 bg-white p-4 rounded-xl shadow-xl z-20 animate-float hidden md:block border border-brand-beige/30">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Travel Insured Trips</p>
                    <p className="text-lg font-black text-brand-black">Verified</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 -right-8 bg-white p-4 rounded-xl shadow-xl z-20 animate-float animate-delay-200 hidden md:block border border-brand-beige/30">
                <div className="flex -space-x-3 mb-2">
                  {[1, 2, 3].map(i => (
                    <img key={i} className="w-8 h-8 rounded-full border-2 border-white object-cover" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-brand-cream text-brand-olive flex items-center justify-center text-[10px] font-bold">+2k</div>
                </div>
                <p className="text-xs font-bold text-center text-brand-black/60 uppercase tracking-wider">Happy Travelers</p>
              </div>

              {/* Decorative border */}
              <div className="absolute -z-10 top-3 right-3 w-full h-full border-2 border-dashed border-brand-olive/20 rounded-sm"></div>
            </div>

          </div>
        </div>
      </section>

      {/* Dynamic Trip Category Carousels */}
      {Object.keys(groupedTrips).length === 0 && loading ? (
        <TripCarousel category="Trending Expeditions" categoryTrips={[]} loading={true} />
      ) : (
        Object.entries(groupedTrips).map(([category, categoryTrips]) => (
          <TripCarousel key={category} category={category} categoryTrips={categoryTrips} loading={false} />
        ))
      )}

      {/* Main Filtered Grid Section */}
      <section className="bg-brand-beige py-20 w-full relative z-10 border-y border-brand-olive/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mb-3 font-serif uppercase tracking-wide">Curated Journeys</h2>
              <p className="text-brand-black/60 text-lg">Handpicked trips for the rugged soul.</p>
            </div>

            {/* Duration Filter */}
            <div className="flex items-center bg-brand-cream p-1.5 rounded-lg overflow-x-auto max-w-full border border-brand-olive/20 shadow-sm">
              <span className="px-3 text-brand-olive font-bold text-xs uppercase flex items-center gap-1 tracking-wider">
                <Filter size={12} /> Filter:
              </span>
              {durations.map(duration => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`
                    px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap
                    ${selectedDuration === duration
                      ? 'bg-brand-olive text-brand-cream shadow-sm'
                      : 'text-brand-olive/50 hover:text-brand-olive'}
                    `}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[400px] bg-brand-cream rounded-md animate-pulse"></div>
              ))}
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredTrips.map((trip, index) => (
                <div key={trip.id} className={`animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                  <TripCard trip={trip} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-brand-cream rounded-xl border border-dashed border-brand-olive/30">
              <div className="bg-brand-beige w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-brand-black" size={32} />
              </div>
              <p className="text-xl text-brand-olive font-medium">No adventures found matching your criteria.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedDuration('All'); }}
                className="mt-6 text-brand-olive font-bold hover:underline flex items-center justify-center gap-2 mx-auto uppercase tracking-wide text-sm"
              >
                Clear filters <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </section>



      {/* Testimonials */}
      <section className="bg-brand-cream py-24 border-b border-brand-olive/10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-brand-olive font-serif">Traveler Tales</h2>
          </div>

          {testimonials.length > 0 && (
            <div
              className="relative bg-white rounded-lg border border-brand-olive/20 p-10 md:p-14 mx-auto max-w-4xl shadow-sm hover:shadow-lg transition-all"
              onMouseEnter={() => setIsTestimonialHovered(true)}
              onMouseLeave={() => setIsTestimonialHovered(false)}
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-brand-olive bg-brand-cream p-3 rounded-full shadow-lg">
                <Quote size={32} fill="currentColor" />
              </div>

              <div className="flex flex-col items-center text-center animate-fade-in" key={testimonialIndex}>
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={`${i < testimonials[testimonialIndex].rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-2xl md:text-3xl text-brand-black font-sans italic mb-8 leading-relaxed">"{testimonials[testimonialIndex].quote}"</p>

                <div className="flex items-center gap-4">
                  <img
                    src={testimonials[testimonialIndex].avatarUrl}
                    alt={testimonials[testimonialIndex].name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brand-beige"
                  />
                  <div className="text-left">
                    <h4 className="font-bold text-brand-black uppercase text-sm tracking-wide">{testimonials[testimonialIndex].name}</h4>
                    <span className="text-brand-cream text-xs font-bold flex items-center gap-1"><MapPin size={10} /> {testimonials[testimonialIndex].location}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between w-full absolute top-1/2 left-0 px-4 -translate-y-1/2 pointer-events-none">
                <button onClick={prevTestimonial} className="pointer-events-auto p-2 rounded-full bg-brand-beige border border-brand-olive/20 hover:bg-brand-olive hover:text-brand-black transition text-brand-black">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextTestimonial} className="pointer-events-auto p-2 rounded-full bg-brand-beige border border-brand-olive/20 hover:bg-brand-olive hover:text-brand-black transition text-brand-black">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Stats - Enhanced with Animations and Features */}
      <section className="bg-brand-cream border-t border-brand-olive/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-extrabold text-brand-olive mb-6 font-serif">Why Wheel to Wilderness?</h2>
              <p className="text-xl text-brand-olive/60 leading-relaxed font-light">More than just a booking platform. We are a community driven by adventure, safety, and the wild.</p>
            </div>
          </ScrollReveal>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {homeStats.map((stat, index) => (
              <ScrollReveal delay={index * 100} className="h-full" key={index}>
                <StatCounter 
                  end={stat.end} 
                  suffix={stat.suffix} 
                  label={stat.label} 
                  icon={getMarqueeIcon(stat.iconName || 'Star')} 
                />
              </ScrollReveal>
            ))}
          </div>

          {/* Detailed Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <ScrollReveal delay={100}>
              <div className="flex gap-4 items-start group">
                <div className="p-3 bg-brand-olive text-brand-black rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-olive mb-2 font-serif">Verified Safety</h3>
                  <p className="text-brand-olive/60 text-sm leading-relaxed">Every route is vetted. Every guide is certified. Your safety is our non-negotiable priority.</p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="flex gap-4 items-start group">
                <div className="p-3 bg-brand-olive text-brand-black rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Leaf size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-olive mb-2 font-serif">Eco-Conscious</h3>
                  <p className="text-brand-olive/60 text-sm leading-relaxed">We leave no trace. Our trips support local communities and minimize environmental impact.</p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="flex gap-4 items-start group">
                <div className="p-3 bg-brand-olive text-brand-black rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-olive mb-2 font-serif">Small Batches</h3>
                  <p className="text-brand-olive/60 text-sm leading-relaxed">Maximum 12 travelers per trip. Intimate, engaging, and perfect for making real connections.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Enquiry Form Section - Dark Mode */}
      <section className="bg-brand-black py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            <div className="text-brand-olive">
              <span className="text-brand-olive font-bold tracking-widest uppercase text-xs mb-4 block">Get in Touch</span>
              <h2 className="text-5xl font-bold mb-8 font-serif text-brand-olive">Plan your <br />Next Escape.</h2>
              <p className="text-lg text-brand-olive/60 mb-10 leading-relaxed font-light">
                Whether you're planning your first solo trip or a group getaway, our travel experts are ready to assist you.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="bg-brand-olive/20 p-4 rounded-full text-brand-olive group-hover:bg-brand-olive group-hover:text-brand-cream transition">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-brand-olive">Email Us</h4>
                    <p className="text-brand-olive/50">experiences@wheelstowilderness.in</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="bg-brand-olive/20 p-4 rounded-full text-brand-olive group-hover:bg-brand-olive group-hover:text-brand-cream transition">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-brand-olive">Call Us</h4>
                    <p className="text-brand-olive/50">+91 96064 99422</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-beige p-10 rounded-lg shadow-2xl border-l-4 border-brand-olive">
              <h3 className="text-2xl font-bold text-brand-black mb-8 font-serif">Send an Enquiry</h3>
              {enquiryStatus === 'success' ? (
                <div className="bg-brand-olive/10 text-brand-olive p-8 rounded-lg text-center border border-brand-olive/20">
                  <div className="bg-brand-olive w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-cream">
                    <Send size={24} />
                  </div>
                  <h4 className="font-bold text-xl mb-2">Message Sent!</h4>
                  <p className="text-brand-black/60 text-sm">We will get back to you shortly.</p>
                  <button onClick={() => setEnquiryStatus('idle')} className="mt-6 text-brand-black font-bold text-sm underline hover:text-brand-olive">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none bg-white text-brand-black"
                      placeholder="Your Name"
                      value={enquiryData.name}
                      onChange={e => setEnquiryData({ ...enquiryData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Travellers</label>
                      <input
                        type="number"
                        min={1}
                        required
                        className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none bg-white text-brand-black"
                        placeholder="No. of Travellers"
                        value={enquiryData.Travellers}
                        onChange={e => setEnquiryData({ ...enquiryData, Travellers: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Where?</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none bg-white text-brand-black"
                          placeholder="Destination or region (e.g. Hampi, Gokarna...)"
                          value={enquiryData.where}
                          onChange={e => setEnquiryData({ ...enquiryData, where: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">When?</label>
                        <input
                          type="Date"
                          required
                          className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none bg-white text-brand-black"
                          placeholder="DD/MM/YYY"
                          value={enquiryData.traveldate}
                          onChange={e => setEnquiryData({ ...enquiryData, traveldate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Phone</label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none bg-white text-brand-black"
                      placeholder="+91..."
                      value={enquiryData.phone}
                      onChange={e => setEnquiryData({ ...enquiryData, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Message</label>
                    <textarea
                      required
                      className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none h-32 bg-white text-brand-black"
                      placeholder="Tell us about your trip plans..."
                      value={enquiryData.message}
                      onChange={e => setEnquiryData({ ...enquiryData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={enquiryStatus === 'submitting'}
                    className="w-full bg-brand-olive text-brand-cream font-bold py-4 rounded-md hover:bg-brand-black transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-wider text-sm"
                  >
                    {enquiryStatus === 'submitting' ? 'Sending...' : 'Send Message'} <ArrowRight size={18} />
                  </button>

                  {enquiryStatus === 'error' && (
                    <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
                  )}
                </form>

              )}
            </div>

          </div>
        </div>
      </section>

      {/* Gallery Section - Darker Theme */}
      <section className="bg-brand-black py-20 text-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-cream font-serif uppercase tracking-wide">Visual Log</h2>
              <p className="text-brand-cream/60 mt-2 uppercase text-xs tracking-widest">Captured by our community</p>
            </div>
            <a
              href="https://instagram.com/wheelstowilderness"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-brand-olive font-bold hover:text-brand-sage transition"
            >
              <Camera size={20} /> @wheelstowilderness
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 auto-rows-[200px] md:auto-rows-[300px]">
            {galleryImages.map((img, idx) => (
              <div
                key={idx}
                className={`
                            relative overflow-hidden cursor-pointer group opacity-90 hover:opacity-100 transition-opacity
                            ${idx === 0 ? 'col-span-2 row-span-2' : ''}
                        `}
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={img.imageUrl}
                  alt={img.caption || `Gallery ${idx}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-brand-olive/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-brand-cream border border-brand-cream px-4 py-2 uppercase text-xs font-bold tracking-widest hover:bg-brand-cream hover:text-brand-black transition">View</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[60] bg-brand-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-brand-cream hover:text-gray-300 z-50 p-2 focus:outline-none" onClick={closeLightbox}>
            <X size={32} />
          </button>

          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-cream hover:text-gray-300 p-2 bg-white/10 rounded-full hover:bg-white/20 transition focus:outline-none" onClick={prevImage}>
            <ChevronLeft size={40} />
          </button>

          <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={galleryImages[currentImageIndex]?.imageUrl}
              alt={galleryImages[currentImageIndex]?.caption || "Full screen"}
              className="max-h-[75vh] max-w-[90vw] object-contain border-4 border-brand-cream shadow-2xl"
            />
            {galleryImages[currentImageIndex]?.caption && (
              <div className="mt-4 flex items-center gap-2 text-white bg-black/60 backdrop-blur-md px-5 py-2.5 rounded-lg border border-white/20">
                <MapPin size={16} className="text-yellow-400 flex-shrink-0" />
                <span className="text-base font-bold tracking-wide">{galleryImages[currentImageIndex].caption}</span>
              </div>
            )}
          </div>

          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-cream hover:text-gray-300 p-2 bg-white/10 rounded-full hover:bg-white/20 transition focus:outline-none" onClick={nextImage}>
            <ChevronRight size={40} />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-brand-black text-xs font-bold bg-brand-beige px-4 py-1 uppercase tracking-widest rounded-full">
            {currentImageIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Home;