import React from 'react';
import { Compass, Heart, Users, Mountain, Leaf, Star, ArrowRight, Trophy, Map, Flame, Zap, MapPin, Gift, Percent, Tag, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const ICON_MAP: Record<string, React.ReactNode> = {
    Trophy: <Trophy size={24} />,
    Users: <Users size={24} />,
    Map: <Map size={24} />,
    Heart: <Heart size={24} />,
    Mountain: <Mountain size={24} />,
    Star: <Star size={24} />,
    Flame: <Flame size={24} />,
    Zap: <Zap size={24} />,
    MapPin: <MapPin size={24} />,
    Gift: <Gift size={24} />,
    Percent: <Percent size={24} />,
    Tag: <Tag size={24} />,
    Clock: <Clock size={24} />,
};

const DEFAULT_STATS = [
    { end: 150, suffix: '+', label: 'Trips Done', iconName: 'Trophy' },
    { end: 5000, suffix: '+', label: 'Travelers', iconName: 'Users' },
    { end: 25, suffix: '+', label: 'Destinations', iconName: 'Map' },
    { end: 40, suffix: '%', label: 'Solo Women', iconName: 'Heart' },
];

const OurStory: React.FC = () => {
    const [content, setContent] = React.useState<any>(null);
    const [homeStats, setHomeStats] = React.useState<any[]>(DEFAULT_STATS);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            try {
                const [storySetting, statsSetting] = await Promise.all([
                    api.getSetting('our_story_content').catch(() => null),
                    api.getSetting('home_stats').catch(() => null),
                ]);
                if (storySetting?.value) setContent(storySetting.value);
                if (statsSetting?.value) setHomeStats(statsSetting.value);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-brand-cream">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-olive"></div>
                </div>
                <Footer />
            </div>
        );
    }
    
    // Default content if not set
    const storyContent = content || {
        heroImage: "https://picsum.photos/id/1036/1920/800",
        heading: "OUR STORY",
        subHeading: "Born from a passion for the wild and a love for authentic adventures.",
        section1Title: "The Beginning",
        section1Text1: "Wheel to Wilderness started in 2019 with a simple idea: to make authentic travel experiences accessible to everyone. What began as weekend road trips with friends evolved into a community of adventure seekers who share the same passion for exploring the unexplored.",
        section1Text2: "We noticed that most travel companies offered cookie-cutter packages that missed the soul of a destination. We wanted to change that. Every trip we curate is designed to immerse you in local cultures, stunning landscapes, and experiences that create lasting memories.",
        section2Title: "Our Mission",
        section2Text: "We believe that travel has the power to transform lives. Our mission is to create experiences that connect people with nature, local communities, and each other. We're committed to responsible tourism that benefits both travelers and the destinations we visit."
    };

    return (
        <div className="min-h-screen flex flex-col bg-brand-cream">
            <SEO
                title="Our Story"
                description="Learn about Wheels to Wilderness - born from a passion for the wild and authentic adventures. 150+ trips, 5000+ travelers, and memories that last a lifetime."
                keywords="about wheels to wilderness, travel company, adventure travel, India tours, sustainable travel"
                url="/our-story"
                image="https://wheelstowilderness.in/og-image.jpg"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-brand-black text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src={storyContent.heroImage}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-sage/20 text-brand-sage text-xs font-bold uppercase tracking-widest mb-6 border border-brand-sage/30">
                        <Compass size={14} /> About Us
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black font-serif mb-6">{storyContent.heading}</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto leading-relaxed">
                        {storyContent.subHeading}
                    </p>
                </div>
            </section>

            {/* Story Content */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="prose prose-lg max-w-none">
                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 mb-12">
                            <h2 className="text-3xl font-bold text-brand-black font-serif mb-6">{storyContent.section1Title}</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                {storyContent.section1Text1}
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                {storyContent.section1Text2}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {homeStats.map((stat: any, i: number) => (
                                <div key={i} className="bg-brand-sage/10 p-6 rounded-xl text-center border border-brand-sage/20">
                                    <div className="bg-brand-sage text-white w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                                        {ICON_MAP[stat.iconName] || <Trophy size={24} />}
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-xl mb-1">
                                        {stat.end}{stat.suffix}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-snug">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 mb-12">
                            <h2 className="text-3xl font-bold text-brand-black font-serif mb-6">{storyContent.section2Title}</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                {storyContent.section2Text}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-sage/10 p-3 rounded-lg text-brand-sage">
                                        <Leaf size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-black mb-1">Sustainable Travel</h4>
                                        <p className="text-sm text-gray-600">Leave no trace, support local economies</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-sage/10 p-3 rounded-lg text-brand-sage">
                                        <Heart size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-brand-black mb-1">Authentic Experiences</h4>
                                        <p className="text-sm text-gray-600">Beyond tourist spots, into real cultures</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 bg-brand-sage text-white px-8 py-4 rounded-lg font-bold hover:bg-brand-black transition uppercase tracking-wider text-sm"
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
