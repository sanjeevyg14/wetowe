import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, Clock, Users, Star, ArrowRight, ChevronDown,
  Sun, Moon, Camera, Tent, Compass, Heart, Shield, Check,
  Phone, Mail, Send, X, ChevronLeft, ChevronRight, Sparkles,
  Mountain, Flame, Eye, Music, Palette
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

// ─── Countdown Timer ────────────────────────────────────────────────
const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) return;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-4">
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 sm:px-5 py-2 sm:py-3 min-w-[56px] sm:min-w-[72px] text-center">
            <span className="text-2xl sm:text-4xl font-black text-white font-serif tabular-nums">
              {String(unit.value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold mt-2">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Itinerary Data ─────────────────────────────────────────────────
const itinerary = [
  {
    day: 1,
    title: 'Arrival in Bhuj',
    icon: <Compass size={22} />,
    time: 'Evening',
    description: 'Arrive at Bhuj. Check into your heritage stay. Evening orientation, team introductions, and a traditional Kutchi welcome dinner under the stars.',
    highlights: ['Airport/Station Pickup', 'Heritage Stay Check-in', 'Welcome Dinner'],
    image: '/rann-culture.jpg',
  },
  {
    day: 2,
    title: 'White Desert & Sunset',
    icon: <Sun size={22} />,
    time: 'Full Day',
    description: 'After breakfast, drive to the Great Rann of Kutch. Walk on the infinite white salt desert. Witness the magical sunset where the sky meets the white horizon. Camel ride across the salt flats.',
    highlights: ['Great Rann Visit', 'Camel Safari', 'Sunset at White Desert'],
    image: '/rann-desert.jpg',
  },
  {
    day: 3,
    title: 'Kutch Culture Trail',
    icon: <Palette size={22} />,
    time: 'Full Day',
    description: 'Explore the vibrant artisan villages of Kutch. Visit Bhujodi for weaving, Ajrakhpur for block printing, and the ancient Kutchi mud-hut villages (Bhungas) with their stunning mirror work.',
    highlights: ['Artisan Village Visits', 'Textile Workshops', 'Bhunga Heritage Walk'],
    image: '/rann-culture.jpg',
  },
  {
    day: 4,
    title: 'Full Moon Night & Farewell',
    icon: <Moon size={22} />,
    time: 'Full Day',
    description: 'Visit Kala Dungar (Black Hill) — the highest point in Kutch. Afternoon free for local market shopping. Return to the White Desert for a magical full-moon night experience with bonfire and folk music. Farewell dinner.',
    highlights: ['Kala Dungar Viewpoint', 'Full Moon Salt Desert', 'Bonfire & Folk Music'],
    image: '/rann-moonlight.jpg',
  },
  {
    day: 5,
    title: 'Departure',
    icon: <Heart size={22} />,
    time: 'Morning',
    description: 'Breakfast and checkout. Drop to Bhuj airport/railway station. Carry home memories that will last a lifetime.',
    highlights: ['Breakfast & Checkout', 'Station/Airport Drop', 'Lifetime Memories'],
    image: '/rann-hero.jpg',
  },
];

// ─── Gallery Data ───────────────────────────────────────────────────
const galleryImages = [
  { src: '/rann-hero.jpg', caption: 'Sunset over the White Desert' },
  { src: '/rann-desert.jpg', caption: 'The Infinite Salt Flats' },
  { src: '/rann-culture.jpg', caption: 'Kutchi Culture & Heritage' },
  { src: '/rann-moonlight.jpg', caption: 'Full Moon Magic' },
];

// ─── Main Page Component ────────────────────────────────────────────
const RannOfKutch: React.FC = () => {
  const [activeDay, setActiveDay] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', travelers: '', message: '' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Trip launch date — set to ~2 months from now
  const launchDate = new Date('2027-01-15T06:00:00');

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquiryStatus('submitting');
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setEnquiryStatus('success');
      setFormData({ name: '', phone: '', email: '', travelers: '', message: '' });
    } catch {
      setEnquiryStatus('error');
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream overflow-x-hidden font-sans">
      <SEO
        title="Rann of Kutch Expedition — Gujarat | Wheels to Wilderness"
        description="Experience the surreal white salt desert of the Great Rann of Kutch, Gujarat. 5-day curated expedition with camel safaris, full moon nights, Kutchi culture & more."
        keywords="Rann of Kutch, Gujarat trip, white desert, salt desert, Rann Utsav, Kutch expedition, Gujarat travel, camel safari, full moon night"
        url="/rann-of-kutch"
      />
      <Navbar />

      {/* ═══════ HERO SECTION ═══════ */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden">
        {/* Parallax Background */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <motion.img
            src="/rann-hero.jpg"
            alt="Rann of Kutch White Desert Sunset"
            className="w-full h-[120%] object-cover"
            animate={{ x: mousePos.x * -0.5, y: mousePos.y * -0.5 }}
            transition={{ type: 'spring', stiffness: 50, damping: 30 }}
          />
        </motion.div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-10" />

        {/* Content */}
        <motion.div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4"
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="space-y-6 max-w-4xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full mx-auto"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-white/90">
                New Trip Launch — Limited Spots
              </span>
            </motion.div>

            {/* Location */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex items-center justify-center gap-2 text-white/60"
            >
              <MapPin size={14} />
              <span className="text-xs sm:text-sm uppercase tracking-[0.2em] font-bold">Gujarat, India</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-serif text-white leading-[0.9] tracking-tight"
            >
              RANN OF
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-400">
                KUTCH
              </span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-lg sm:text-xl text-white/70 max-w-xl mx-auto font-light leading-relaxed"
            >
              Where the earth meets the sky. Walk on an infinite white canvas under the stars.
            </motion.p>

            {/* Quick Info Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
            >
              {[
                { icon: <Calendar size={14} />, text: '5 Days / 4 Nights' },
                { icon: <Users size={14} />, text: 'Max 12 Travelers' },
                { icon: <Star size={14} className="fill-amber-300 text-amber-300" />, text: 'Premium Experience' },
              ].map((pill, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3 sm:px-4 py-2 rounded-full text-white/80 text-xs sm:text-sm font-medium"
                >
                  {pill.icon}
                  <span>{pill.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Countdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8 }}
              className="pt-4"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-4">
                Trip Launches In
              </p>
              <div className="flex justify-center">
                <CountdownTimer targetDate={launchDate} />
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={28} className="text-white/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ INTRODUCTION ═══════ */}
      <motion.section
        className="py-24 md:py-32 bg-brand-cream relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 text-brand-sage text-xs font-bold uppercase tracking-[0.3em] mb-6">
            <Compass size={14} />
            About the Expedition
          </span>
          <h2 className="text-4xl md:text-6xl font-black font-serif text-brand-olive mb-8 leading-tight">
            A Desert That
            <br />
            <span className="italic text-brand-beige">Defies Reality</span>
          </h2>
          <p className="text-lg md:text-xl text-brand-olive/60 max-w-3xl mx-auto leading-relaxed font-light">
            The Great Rann of Kutch is one of the largest salt deserts in the world — a surreal, lunar landscape
            that stretches for over 7,500 sq km. During the Rann Utsav season, this vast white canvas transforms
            into a cultural extravaganza. Walk barefoot on crystalline salt under the full moon, ride camels across
            the horizon, and immerse yourself in 5,000 years of living Kutchi art and tradition.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '7,505', unit: 'sq km', label: 'White Desert Area' },
              { value: '5,000+', unit: 'years', label: 'Cultural Heritage' },
              { value: '4.9', unit: '★', label: 'Traveler Rating' },
              { value: '12', unit: 'max', label: 'Travelers Per Batch' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="p-6 bg-brand-cream rounded-2xl border border-brand-olive/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl font-black text-brand-olive font-serif">
                  {stat.value}
                  <span className="text-brand-sage text-sm ml-1">{stat.unit}</span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-brand-olive/60 font-bold mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════ EXPERIENCE HIGHLIGHTS ═══════ */}
      <motion.section
        className="py-24 bg-brand-black text-white relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-[0.3em] mb-4">
              <Sparkles size={14} />
              What Awaits You
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-serif mb-4">
              Unforgettable <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-orange-300">Experiences</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Eye size={28} />, title: 'White Desert Walk', desc: 'Walk on the surreal, infinite white salt flats that stretch to the horizon. A once-in-a-lifetime sight.', color: 'from-sky-400 to-blue-500' },
              { icon: <Moon size={28} />, title: 'Full Moon Night', desc: 'Experience the magical full-moon night on the white desert where moonlight turns the salt into silver.', color: 'from-indigo-400 to-purple-500' },
              { icon: <Tent size={28} />, title: 'Desert Camping', desc: 'Camp under the Milky Way in luxury tents. Bonfire nights with folk music and Kutchi cuisine.', color: 'from-amber-400 to-orange-500' },
              { icon: <Palette size={28} />, title: 'Artisan Workshops', desc: 'Hands-on experience with master artisans — Ajrakh printing, Kutchi embroidery, and mirror work.', color: 'from-rose-400 to-pink-500' },
              { icon: <Music size={28} />, title: 'Folk Performances', desc: 'Live performances of traditional Kutchi folk music and dance under the desert sky.', color: 'from-emerald-400 to-teal-500' },
              { icon: <Mountain size={28} />, title: 'Kala Dungar Summit', desc: 'Hike to the highest point in Kutch with panoramic views of the vast Rann and the Pakistan border.', color: 'from-violet-400 to-indigo-500' },
            ].map((exp, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                viewport={{ once: true }}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-default overflow-hidden"
              >
                {/* Glow effect on hover */}
                <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${exp.color} rounded-full opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700`} />

                <div className={`relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br ${exp.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {exp.icon}
                </div>
                <h3 className="text-xl font-bold font-serif mb-3 relative z-10">{exp.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed relative z-10">{exp.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════ INTERACTIVE ITINERARY ═══════ */}
      <motion.section
        className="py-24 md:py-32 bg-brand-cream"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-brand-sage text-xs font-bold uppercase tracking-[0.3em] mb-4">
              <Clock size={14} />
              Day by Day
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-serif text-brand-olive mb-4">
              Your <span className="italic text-brand-beige">Journey</span> Unfolds
            </h2>
            <p className="text-brand-olive/50 max-w-xl mx-auto">
              5 days of discovery across one of the most extraordinary landscapes on Earth.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Day Selector - Left Column */}
            <div className="lg:w-[340px] flex-shrink-0">
              <div className="sticky top-28 space-y-2">
                {itinerary.map((item, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                      activeDay === i
                        ? 'bg-brand-cream text-brand-olive border-brand-cream shadow-xl shadow-brand-cream/20'
                        : 'bg-brand-beige border-brand-olive/10 hover:border-brand-sage/30 hover:shadow-md'
                    }`}
                    whileHover={{ x: activeDay === i ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        activeDay === i
                          ? 'bg-brand-olive/20 text-brand-olive'
                          : 'bg-brand-cream/20 text-brand-cream group-hover:bg-brand-cream/30'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-0.5 ${
                          activeDay === i ? 'text-brand-olive/60' : 'text-brand-black/40'
                        }`}>
                          Day {item.day} — {item.time}
                        </div>
                        <div className={`font-bold text-sm truncate ${
                          activeDay === i ? 'text-brand-olive' : 'text-brand-black'
                        }`}>
                          {item.title}
                        </div>
                      </div>
                      <ArrowRight size={16} className={`flex-shrink-0 transition-all ${
                        activeDay === i ? 'text-brand-olive/80 translate-x-0' : 'text-brand-black/20 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                      }`} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Day Detail - Right Column */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDay}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="bg-brand-beige rounded-2xl border border-brand-olive/10 overflow-hidden shadow-sm"
                >
                  {/* Day Image */}
                  <div className="relative h-[300px] md:h-[400px] overflow-hidden">
                    <img
                      src={itinerary[activeDay].image}
                      alt={itinerary[activeDay].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-8">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-bold mb-2">
                        Day {itinerary[activeDay].day}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black font-serif text-white">
                        {itinerary[activeDay].title}
                      </h3>
                    </div>
                  </div>

                  {/* Day Content */}
                  <div className="p-6 md:p-8">
                    <p className="text-brand-black/70 leading-relaxed text-base mb-8">
                      {itinerary[activeDay].description}
                    </p>

                    {/* Highlights */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase tracking-[0.2em] text-brand-black/40 font-bold">Key Highlights</h4>
                      <div className="flex flex-wrap gap-2">
                        {itinerary[activeDay].highlights.map((h, j) => (
                          <span
                            key={j}
                            className="inline-flex items-center gap-1.5 bg-brand-cream/10 border border-brand-cream/20 text-brand-black px-3 py-1.5 rounded-full text-xs font-bold"
                          >
                            <Check size={12} className="text-brand-sage" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════ PHOTO GALLERY ═══════ */}
      <motion.section
        className="py-24 bg-brand-black text-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-[0.3em] mb-4">
              <Camera size={14} />
              Visual Preview
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-serif">
              A Glimpse of <span className="italic text-amber-200">What Awaits</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                  <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-bold">{img.caption}</p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                    <Camera size={16} className="text-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════ PRICING & CTA ═══════ */}
      <motion.section
        className="py-24 md:py-32 bg-brand-cream relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 text-brand-sage text-xs font-bold uppercase tracking-[0.3em] mb-4">
              <Star size={14} />
              Pricing
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-serif text-brand-olive mb-4">
              Your Expedition <span className="italic text-brand-beige">Awaits</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Standard */}
            <div className="bg-brand-beige rounded-2xl border border-brand-cream/20 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-black/40 font-bold mb-2">Standard</div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-black text-brand-black font-serif">₹14,999</span>
                <span className="text-brand-black/40 text-sm">/person</span>
              </div>
              <p className="text-brand-black/50 text-sm mb-8">The complete Rann of Kutch experience.</p>

              <div className="space-y-3 mb-8">
                {[
                  '4 Nights Heritage Stay',
                  'All Meals Included',
                  'Camel Safari',
                  'White Desert Access',
                  'Cultural Village Tours',
                  'Expert Trip Leader',
                  'Airport/Station Transfers',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-brand-black/70">
                    <Check size={16} className="text-brand-sage flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="#enquiry"
                className="block text-center bg-brand-cream text-brand-olive font-bold py-3.5 rounded-xl hover:bg-brand-black hover:text-brand-olive transition-all duration-300 text-sm uppercase tracking-wider"
              >
                Enquire Now
              </a>
            </div>

            {/* Early Bird */}
            <div className="relative bg-brand-cream rounded-2xl p-8 shadow-xl shadow-brand-cream/20 text-brand-olive">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-brand-black text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                🔥 Early Bird — Save ₹2,000
              </div>

              <div className="text-[10px] uppercase tracking-[0.2em] text-brand-olive/50 font-bold mb-2 mt-2">Early Bird</div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-4xl font-black font-serif text-brand-olive">₹12,999</span>
                <span className="text-brand-olive/40 text-sm">/person</span>
              </div>
              <div className="text-sm text-brand-olive/40 line-through mb-4">₹14,999</div>
              <p className="text-brand-olive/60 text-sm mb-8">Limited offer — first 20 bookings only.</p>

              <div className="space-y-3 mb-8">
                {[
                  'Everything in Standard',
                  '🌙 Full Moon Night Experience',
                  '🎵 Private Folk Music Evening',
                  '📸 Professional Trip Photos',
                  '🎁 Exclusive Kutchi Souvenir',
                  '⭐ Priority Campsite Selection',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-brand-olive/80">
                    <Check size={16} className="text-brand-sage flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="#enquiry"
                className="block text-center bg-brand-olive text-brand-cream font-bold py-3.5 rounded-xl hover:bg-brand-beige hover:text-brand-black transition-all duration-300 text-sm uppercase tracking-wider shadow-lg"
              >
                Grab Early Bird Spot
              </a>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            {[
              { icon: <Shield size={18} />, text: 'Verified Safety' },
              { icon: <Heart size={18} />, text: '100% Refundable' },
              { icon: <Users size={18} />, text: 'Small Groups Only' },
              { icon: <Flame size={18} />, text: '150+ Trips Done' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-brand-olive/60 text-xs font-bold uppercase tracking-wider">
                {badge.icon}
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════ ENQUIRY FORM ═══════ */}
      <motion.section
        id="enquiry"
        className="py-24 bg-brand-black relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={sectionVariants}
      >
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url('/rann-hero.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px)',
        }} />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-[0.3em] mb-4">
              <Send size={14} />
              Reserve Your Spot
            </span>
            <h2 className="text-4xl md:text-5xl font-black font-serif text-white mb-4">
              Ready for the <span className="italic text-amber-200">White Desert</span>?
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Drop your details and our expedition team will reach out within 24 hours with full trip details and booking info.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12">
            {enquiryStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={36} className="text-green-400" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-white mb-3">You're On The List! 🎉</h3>
                <p className="text-white/50 mb-6">Our expedition team will contact you within 24 hours. Get ready for the white desert!</p>
                <button
                  onClick={() => setEnquiryStatus('idle')}
                  className="text-amber-300 font-bold text-sm hover:underline"
                >
                  Submit another enquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-300/50 focus:ring-1 focus:ring-amber-300/20 transition"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Phone</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-300/50 focus:ring-1 focus:ring-amber-300/20 transition"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-300/50 focus:ring-1 focus:ring-amber-300/20 transition"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">No. of Travelers</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      required
                      placeholder="How many?"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-300/50 focus:ring-1 focus:ring-amber-300/20 transition"
                      value={formData.travelers}
                      onChange={e => setFormData({ ...formData, travelers: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-2">Message (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Any special requests, dietary needs, or questions?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-300/50 focus:ring-1 focus:ring-amber-300/20 transition resize-none"
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={enquiryStatus === 'submitting'}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-400 text-brand-black font-black py-4 rounded-xl hover:from-amber-300 hover:to-orange-300 transition-all duration-300 text-sm uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {enquiryStatus === 'submitting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Reserve My Spot <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {enquiryStatus === 'error' && (
                  <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-12">
            <a href="mailto:experiences@wheelstowilderness.in" className="flex items-center gap-2 text-white/40 hover:text-amber-300 transition text-sm">
              <Mail size={16} />
              experiences@wheelstowilderness.in
            </a>
            <a href="tel:+919606499422" className="flex items-center gap-2 text-white/40 hover:text-amber-300 transition text-sm">
              <Phone size={16} />
              +91 96064 99422
            </a>
          </div>
        </div>
      </motion.section>

      {/* ═══════ LIGHTBOX ═══════ */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 z-50"
              onClick={() => setLightboxIndex(null)}
            >
              <X size={32} />
            </button>

            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition z-50"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + galleryImages.length) % galleryImages.length); }}
            >
              <ChevronLeft size={32} />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={galleryImages[lightboxIndex].src}
              alt={galleryImages[lightboxIndex].caption}
              className="max-h-[80vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition z-50"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % galleryImages.length); }}
            >
              <ChevronRight size={32} />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20">
              {galleryImages[lightboxIndex].caption} — {lightboxIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default RannOfKutch;
