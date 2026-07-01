import React from 'react';
import { Linkedin, Instagram, Mail, Quote } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

import { TeamMember } from '../types';
import { api } from '../services/api';

const Team: React.FC = () => {
    const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchTeam = async () => {
            try {
                const members = await api.getTeamMembers();
                setTeamMembers(members);
            } catch (err) {
                console.error("Failed to fetch team members", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
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
    return (
        <div className="min-h-screen flex flex-col bg-brand-cream">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-brand-black text-brand-cream py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <img
                        src="https://picsum.photos/id/1074/1920/800"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-black font-serif mb-6">MEET THE TEAM</h1>
                    <p className="text-xl text-white max-w-2xl mx-auto leading-relaxed">
                        The passionate explorers behind every adventure.
                    </p>
                </div>
            </section>

            {/* Team Grid */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {teamMembers.map((member, index) => (
                            <div
                                key={member.name}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-brand-olive/10 hover:shadow-xl transition-all duration-500 group"
                            >
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-2/5 relative overflow-hidden">
                                        <img
                                            src={member.imageUrl}
                                            alt={member.name}
                                            className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-black/80 to-transparent p-4 md:hidden">
                                            <h3 className="text-xl font-bold text-brand-cream font-serif">{member.name}</h3>
                                            <p className="text-brand-olive text-sm font-bold uppercase tracking-wider">{member.role}</p>
                                        </div>
                                    </div>
                                    <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                                        <div className="hidden md:block">
                                            <h3 className="text-2xl font-bold text-brand-black font-serif mb-1">{member.name}</h3>
                                            <p className="text-brand-olive text-sm font-bold uppercase tracking-wider mb-4">{member.role}</p>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed mb-6">{member.bio}</p>
                                        <div className="flex gap-3">
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin}
                                                    className="p-2 bg-brand-olive/10 rounded-full text-brand-olive hover:bg-brand-olive hover:text-brand-cream transition"
                                                >
                                                    <Linkedin size={18} />
                                                </a>
                                            )}
                                            {member.instagram && (
                                                <a
                                                    href={member.instagram}
                                                    className="p-2 bg-brand-olive/10 rounded-full text-brand-olive hover:bg-brand-olive hover:text-brand-cream transition"
                                                >
                                                    <Instagram size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="bg-brand-olive py-16">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <Quote size={40} className="text-brand-cream/30 mx-auto mb-6" />
                    <blockquote className="text-2xl md:text-3xl text-brand-cream font-serif italic mb-6">
                        "We don't just plan trips. We create stories that last a lifetime."
                    </blockquote>
                    <p className="text-white font-bold uppercase tracking-wider text-sm">— The WtoW Team</p>
                </div>
            </section>

            {/* Join Us CTA */}
            <section className="py-16 bg-brand-cream">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-brand-black font-serif mb-4">Join Our Team</h2>
                    <p className="text-gray-700 mb-8">
                        Are you passionate about travel and adventure? We're always looking for like-minded explorers to join our journey.
                    </p>
                    <a
                        href="mailto:careers@wheeltowilderness.com"
                        className="inline-flex items-center gap-2 bg-brand-black text-brand-cream px-8 py-4 rounded-lg font-bold hover:bg-brand-olive transition uppercase tracking-wider text-sm"
                    >
                        <Mail size={18} /> careers@wheeltowilderness.com
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Team;
