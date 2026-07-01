import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, ArrowRight, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { api } from '../services/api';

const ContactUs: React.FC = () => {
    const [enquiryStatus, setEnquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [contactContent, setContactContent] = useState<any>(null);
    const [enquiryData, setEnquiryData] = useState({
        name: '',
        Travellers: '',
        phone: '',
        email: '',
        traveldate: '',
        where: '',
        message: ''
    });

    React.useEffect(() => {
        api.getSetting('contact_us_content').then(res => {
            if (res?.value) setContactContent(res.value);
        }).catch(console.error);
    }, []);

    const content = contactContent || {
        phone: "+91 96064 99422",
        phoneDesc: "Mon-Sat, 9AM - 7PM IST",
        email: "experiences@wheelstowilderness.in",
        emailDesc: "We reply within 24 hours",
        address: "Bangalore, Karnataka",
        addressDesc: "By appointment only"
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

    return (
        <div className="min-h-screen flex flex-col bg-brand-cream">
            <SEO
                title="Contact Us"
                description="Get in touch with Wheels to Wilderness. Plan your next adventure, ask questions, or send an enquiry. We're here to help you explore!"
                keywords="contact wheels to wilderness, travel enquiry, book trip, adventure travel contact"
                url="/contact"
                image="https://wheelstowilderness.in/og-image.jpg"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-brand-black text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://picsum.photos/id/1031/1920/800"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-black font-serif mb-6">CONTACT US</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto leading-relaxed">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-16 -mt-12 relative z-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-brand-olive/10 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="bg-brand-sage text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone size={24} />
                            </div>
                            <h3 className="font-bold text-brand-black text-lg mb-2">Call Us</h3>
                            <p className="text-gray-600 mb-4 text-sm">{content.phoneDesc}</p>
                            <a href={`tel:${content.phone.replace(/[^0-9+]/g, '')}`} className="text-brand-sage font-bold hover:underline">{content.phone}</a>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-brand-olive/10 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="bg-brand-sage text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail size={24} />
                            </div>
                            <h3 className="font-bold text-brand-black text-lg mb-2">Email Us</h3>
                            <p className="text-gray-600 mb-4 text-sm">{content.emailDesc}</p>
                            <a href={`mailto:${content.email}`} className="text-brand-sage font-bold hover:underline">{content.email}</a>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-lg border border-brand-olive/10 text-center hover:shadow-xl transition-all hover:-translate-y-1">
                            <div className="bg-brand-sage text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin size={24} />
                            </div>
                            <h3 className="font-bold text-brand-black text-lg mb-2">Visit Us</h3>
                            <p className="text-gray-600 mb-4 text-sm">{content.addressDesc}</p>
                            <p className="text-brand-sage font-bold">{content.address}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Left Side - Info */}
                        <div>
                            <h2 className="text-4xl font-bold text-brand-olive font-serif mb-6">Let's Plan Your Next Adventure</h2>
                            <p className="text-brand-olive/80 mb-8 leading-relaxed">
                                Whether you're planning a solo trek, a group getaway, or have questions about our trips,
                                fill out the form and our travel experts will get back to you shortly.
                            </p>

                            <div className="space-y-6 mb-8">
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-sage/10 p-3 rounded-lg text-brand-sage">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-black mb-1">Response Time</h4>
                                        <p className="text-sm text-gray-600">We typically respond within 2-4 hours during business hours</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-sage/10 p-3 rounded-lg text-brand-sage">
                                        <MessageCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-black mb-1">WhatsApp Support</h4>
                                        <p className="text-sm text-gray-600">Quick queries? Message us directly on WhatsApp</p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h4 className="font-bold text-brand-olive mb-4 uppercase tracking-wider text-sm">Follow Us</h4>
                                <div className="flex gap-3">
                                    <a href="https://instagram.com/wheelstowilderness" target="_blank" rel="noopener noreferrer" className="p-3 bg-brand-sage/10 rounded-lg text-brand-sage hover:bg-brand-sage hover:text-white transition">
                                        <Instagram size={20} />
                                    </a>
                                    <a href="#" className="p-3 bg-brand-sage/10 rounded-lg text-brand-sage hover:bg-brand-sage hover:text-white transition">
                                        <Facebook size={20} />
                                    </a>
                                    <a href="#" className="p-3 bg-brand-sage/10 rounded-lg text-brand-sage hover:bg-brand-sage hover:text-white transition">
                                        <Twitter size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Form */}
                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-brand-olive/10">
                            <h3 className="text-2xl font-bold text-brand-black mb-6 font-serif">Send an Enquiry</h3>

                            {enquiryStatus === 'success' ? (
                                <div className="bg-brand-sage/10 text-brand-sage p-8 rounded-lg text-center border border-brand-sage/20">
                                    <div className="bg-brand-sage w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                        <Send size={24} />
                                    </div>
                                    <h4 className="font-bold text-xl mb-2 text-brand-black">Message Sent!</h4>
                                    <p className="text-gray-600 text-sm">We will get back to you shortly.</p>
                                    <button onClick={() => setEnquiryStatus('idle')} className="mt-6 text-brand-black font-bold text-sm underline hover:text-brand-olive">Send another message</button>
                                </div>
                            ) : (
                                <form onSubmit={handleEnquirySubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Full Name</label>
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
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Travellers</label>
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
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                required
                                                className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none bg-white text-brand-black"
                                                placeholder="+91..."
                                                value={enquiryData.phone}
                                                onChange={e => setEnquiryData({ ...enquiryData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Where?</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none bg-white text-brand-black"
                                                placeholder="Destination"
                                                value={enquiryData.where}
                                                onChange={e => setEnquiryData({ ...enquiryData, where: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">When?</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full px-4 py-3 rounded-md border border-brand-black/10 focus:ring-2 focus:ring-brand-olive focus:outline-none bg-white text-brand-black"
                                                value={enquiryData.traveldate}
                                                onChange={e => setEnquiryData({ ...enquiryData, traveldate: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-widest mb-2">Message</label>
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
                                        className="w-full bg-brand-sage text-white font-bold py-4 rounded-md hover:bg-brand-black transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-wider text-sm"
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

            <Footer />
        </div>
    );
};

export default ContactUs;
