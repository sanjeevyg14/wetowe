import React from 'react';
import { Compass, Heart, Users, Mountain, Leaf, Star, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const OurStory: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-brand-cream">
            <SEO
                title="Our Story"
                description="Learn about Wheels to Wilderness - born from a passion for the wild and authentic adventures. 150+ trips, 5000+ travelers, and memories that last a lifetime."
                keywords="about wheels to wilderness, travel company, adventure travel, India tours, sustainable travel"
                url="/our-story"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-brand-black text-brand-cream py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://picsum.photos/id/1036/1920/800"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-olive/20 text-brand-olive text-xs font-bold uppercase tracking-widest mb-6 border border-brand-olive/30">
                        <Compass size={14} /> About Us
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black font-serif mb-6">OUR STORY</h1>
                    <p className="text-xl text-brand-cream/70 max-w-2xl mx-auto leading-relaxed">
                        Born from a passion for the wild and a love for authentic adventures.
                    </p>
                </div>
            </section>

            {/* Story Content */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="prose prose-lg max-w-none">
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-brand-olive/10 mb-12">
                            <h2 className="text-3xl font-bold text-brand-black font-serif mb-6">The Beginning</h2>
                            <p className="text-brand-black/70 leading-relaxed mb-6">
                                Wheel to Wilderness started in 2019 with a simple idea: to make authentic travel experiences accessible to everyone.
                                What began as weekend road trips with friends evolved into a community of adventure seekers who share the same passion
                                for exploring the unexplored.
                            </p>
                            <p className="text-brand-black/70 leading-relaxed">
                                We noticed that most travel companies offered cookie-cutter packages that missed the soul of a destination.
                                We wanted to change that. Every trip we curate is designed to immerse you in local cultures, stunning landscapes,
                                and experiences that create lasting memories.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-brand-olive/5 p-6 rounded-xl text-center border border-brand-olive/10">
                                <div className="bg-brand-olive text-brand-cream w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Mountain size={24} />
                                </div>
                                <h3 className="font-bold text-brand-black mb-2">150+ Trips</h3>
                                <p className="text-sm text-brand-black/60">Successfully completed adventures</p>
                            </div>
                            <div className="bg-brand-olive/5 p-6 rounded-xl text-center border border-brand-olive/10">
                                <div className="bg-brand-olive text-brand-cream w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users size={24} />
                                </div>
                                <h3 className="font-bold text-brand-black mb-2">5000+ Travelers</h3>
                                <p className="text-sm text-brand-black/60">Happy adventurers and counting</p>
                            </div>
                            <div className="bg-brand-olive/5 p-6 rounded-xl text-center border border-brand-olive/10">
                                <div className="bg-brand-olive text-brand-cream w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Star size={24} />
                                </div>
                                <h3 className="font-bold text-brand-black mb-2">4.9 Rating</h3>
                                <p className="text-sm text-brand-black/60">Average customer satisfaction</p>
                            </div>
                        </div>

                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-brand-olive/10 mb-12">
                            <h2 className="text-3xl font-bold text-brand-black font-serif mb-6">Our Mission</h2>
                            <p className="text-brand-black/70 leading-relaxed mb-6">
                                We believe that travel has the power to transform lives. Our mission is to create experiences that connect
                                people with nature, local communities, and each other. We're committed to responsible tourism that benefits
                                both travelers and the destinations we visit.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-olive/10 p-3 rounded-lg text-brand-olive">
                                        <Leaf size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-black mb-1">Sustainable Travel</h4>
                                        <p className="text-sm text-brand-black/60">Leave no trace, support local economies</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-olive/10 p-3 rounded-lg text-brand-olive">
                                        <Heart size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-black mb-1">Authentic Experiences</h4>
                                        <p className="text-sm text-brand-black/60">Beyond tourist spots, into real cultures</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 bg-brand-olive text-brand-cream px-8 py-4 rounded-lg font-bold hover:bg-brand-black transition uppercase tracking-wider text-sm"
                            >
                                Get in Touch <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default OurStory;
