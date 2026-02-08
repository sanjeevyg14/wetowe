import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-brand-cream">
            <SEO
                title="Terms & Conditions"
                description="Read the terms and conditions for using Wheels to Wilderness services. Learn about booking policies, traveler responsibilities, and more."
                keywords="terms and conditions, travel policy, booking terms, wheels to wilderness legal"
                url="/terms"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="bg-brand-black text-brand-cream py-16">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-olive/20 text-brand-olive text-xs font-bold uppercase tracking-widest mb-6 border border-brand-olive/30">
                        <FileText size={14} /> Legal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-serif mb-4">TERMS & CONDITIONS</h1>
                    <p className="text-brand-cream/60">Last updated: February 2024</p>
                </div>
            </section>

            {/* Content */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-brand-olive/10">

                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">1. Acceptance of Terms</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                By accessing and using the Wheel to Wilderness website and services, you accept and agree to be bound by these Terms and Conditions.
                                If you do not agree to these terms, please do not use our services.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">2. Booking and Payments</h2>
                            <p className="text-brand-black/70 mb-4 leading-relaxed">
                                All bookings are subject to availability. To confirm a booking, a deposit or full payment (as specified) must be made.
                                The remaining balance, if any, must be paid before the trip start date as mentioned in the booking confirmation.
                            </p>
                            <ul className="list-disc list-inside text-brand-black/70 mb-6 space-y-2">
                                <li>Payments can be made via UPI, bank transfer, or credit/debit cards</li>
                                <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                                <li>Booking confirmation is sent via email and WhatsApp</li>
                                <li>Group discounts are applicable only for bookings of 4 or more travelers</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">3. Trip Modifications</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                We reserve the right to modify trip itineraries due to weather conditions, safety concerns, or unforeseen circumstances.
                                In such cases, we will provide suitable alternatives. No refunds will be issued for itinerary changes made due to force majeure events.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">4. Traveler Responsibilities</h2>
                            <p className="text-brand-black/70 mb-4 leading-relaxed">
                                As a traveler, you agree to:
                            </p>
                            <ul className="list-disc list-inside text-brand-black/70 mb-6 space-y-2">
                                <li>Provide accurate personal information at the time of booking</li>
                                <li>Arrive at designated pickup points on time</li>
                                <li>Follow instructions given by trip leaders and guides</li>
                                <li>Respect local communities, wildlife, and the environment</li>
                                <li>Not engage in any illegal activities during the trip</li>
                                <li>Maintain appropriate behavior and not cause disturbance to other travelers</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">5. Health and Fitness</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                Some trips may require a certain level of physical fitness. It is the traveler's responsibility to ensure they are medically fit for the chosen trip.
                                Please inform us of any medical conditions, allergies, or special requirements at the time of booking.
                                We recommend travelers have personal travel and health insurance.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">6. Assumption of Risk</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                Adventure travel involves inherent risks. By participating in our trips, you acknowledge and accept these risks.
                                Wheel to Wilderness and its partners shall not be held liable for any injury, illness, death, loss, or damage
                                to personal property arising from participation in our trips, except in cases of gross negligence.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">7. Photography and Media</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                We may take photographs and videos during trips for promotional purposes. By joining our trips, you consent to this.
                                If you do not wish to be photographed, please inform us in advance.
                                Similarly, photos shared by travelers on social media tagging our accounts may be reposted.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">8. Intellectual Property</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                All content on this website, including text, images, logos, and graphics, is the property of Wheel to Wilderness
                                and is protected by copyright laws. You may not reproduce, distribute, or use any content without our prior written consent.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">9. Limitation of Liability</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                To the maximum extent permitted by law, Wheel to Wilderness shall not be liable for any indirect, incidental, special,
                                consequential, or punitive damages arising out of or related to your use of our services.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">10. Governing Law</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                These Terms and Conditions shall be governed by and construed in accordance with the laws of India.
                                Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in Bangalore, Karnataka.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">11. Contact Us</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                If you have any questions about these Terms and Conditions, please contact us at:
                            </p>
                            <div className="bg-brand-olive/5 p-6 rounded-lg border border-brand-olive/20">
                                <p className="text-brand-black/70">
                                    <strong className="text-brand-black">Email:</strong> legal@wheeltowilderness.com<br />
                                    <strong className="text-brand-black">Phone:</strong> +91 98765 43210<br />
                                    <strong className="text-brand-black">Address:</strong> Bangalore, Karnataka, India
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-brand-olive/10">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-brand-olive font-bold hover:text-brand-black transition"
                            >
                                <ArrowLeft size={18} /> Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Terms;
