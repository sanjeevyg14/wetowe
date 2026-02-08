import React from 'react';
import { FileText, ArrowLeft, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';

const CancellationPolicy: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-brand-cream">
            <SEO
                title="Cancellation Policy"
                description="Understand our cancellation and refund policy. Get up to 90% refund for cancellations made 30+ days before your trip."
                keywords="cancellation policy, refund policy, travel cancellation, trip refund"
                url="/cancellation-policy"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="bg-brand-black text-brand-cream py-16">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-olive/20 text-brand-olive text-xs font-bold uppercase tracking-widest mb-6 border border-brand-olive/30">
                        <FileText size={14} /> Legal
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black font-serif mb-4">CANCELLATION POLICY</h1>
                    <p className="text-brand-cream/60">Last updated: February 2024</p>
                </div>
            </section>

            {/* Refund Chart */}
            <section className="py-16 -mt-8 relative z-10">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-brand-olive/10 mb-8">
                        <h2 className="text-2xl font-bold text-brand-black font-serif mb-6 text-center">Refund Schedule</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200">
                                <CheckCircle className="text-green-600 mx-auto mb-3" size={32} />
                                <p className="text-2xl font-black text-green-700 mb-1">90%</p>
                                <p className="text-sm text-green-600 font-bold">Refund</p>
                                <p className="text-xs text-gray-500 mt-2">30+ days before trip</p>
                            </div>
                            <div className="bg-yellow-50 p-6 rounded-xl text-center border border-yellow-200">
                                <Clock className="text-yellow-600 mx-auto mb-3" size={32} />
                                <p className="text-2xl font-black text-yellow-700 mb-1">50%</p>
                                <p className="text-sm text-yellow-600 font-bold">Refund</p>
                                <p className="text-xs text-gray-500 mt-2">15-29 days before trip</p>
                            </div>
                            <div className="bg-orange-50 p-6 rounded-xl text-center border border-orange-200">
                                <AlertCircle className="text-orange-600 mx-auto mb-3" size={32} />
                                <p className="text-2xl font-black text-orange-700 mb-1">25%</p>
                                <p className="text-sm text-orange-600 font-bold">Refund</p>
                                <p className="text-xs text-gray-500 mt-2">7-14 days before trip</p>
                            </div>
                            <div className="bg-red-50 p-6 rounded-xl text-center border border-red-200">
                                <XCircle className="text-red-600 mx-auto mb-3" size={32} />
                                <p className="text-2xl font-black text-red-700 mb-1">0%</p>
                                <p className="text-sm text-red-600 font-bold">No Refund</p>
                                <p className="text-xs text-gray-500 mt-2">Less than 7 days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Policy Content */}
            <section className="pb-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-brand-olive/10">

                        <div className="prose prose-lg max-w-none">
                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">Cancellation by Traveler</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                We understand that plans can change. If you need to cancel your booking, please notify us as soon as possible
                                via email at bookings@wheeltowilderness.com or through WhatsApp. Refunds will be processed based on the following schedule:
                            </p>

                            <div className="bg-brand-olive/5 p-6 rounded-lg border border-brand-olive/20 mb-6">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-brand-olive/20">
                                            <th className="text-left py-2 font-bold text-brand-black">Cancellation Period</th>
                                            <th className="text-right py-2 font-bold text-brand-black">Refund Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-brand-black/70">
                                        <tr className="border-b border-brand-olive/10">
                                            <td className="py-3">More than 30 days before trip start</td>
                                            <td className="text-right py-3 font-bold text-green-600">90% of total amount</td>
                                        </tr>
                                        <tr className="border-b border-brand-olive/10">
                                            <td className="py-3">15consec-29 days before trip start</td>
                                            <td className="text-right py-3 font-bold text-yellow-600">50% of total amount</td>
                                        </tr>
                                        <tr className="border-b border-brand-olive/10">
                                            <td className="py-3">7-14 days before trip start</td>
                                            <td className="text-right py-3 font-bold text-orange-600">25% of total amount</td>
                                        </tr>
                                        <tr>
                                            <td className="py-3">Less than 7 days before trip start</td>
                                            <td className="text-right py-3 font-bold text-red-600">No refund</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">Cancellation by Wheel to Wilderness</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                In rare cases, we may need to cancel a trip due to:
                            </p>
                            <ul className="list-disc list-inside text-brand-black/70 mb-6 space-y-2">
                                <li>Insufficient number of participants (minimum group size not met)</li>
                                <li>Extreme weather conditions or natural disasters</li>
                                <li>Government restrictions or advisories</li>
                                <li>Safety concerns identified by our team</li>
                                <li>Force majeure events beyond our control</li>
                            </ul>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                In such cases, we will offer you either a <strong>full refund</strong> or the option to <strong>reschedule</strong>
                                to another date at no additional cost.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">Date Transfer / Rescheduling</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                Instead of canceling, you may transfer your booking to a different date (subject to availability):
                            </p>
                            <ul className="list-disc list-inside text-brand-black/70 mb-6 space-y-2">
                                <li>Date transfers requested more than 15 days before the trip: <strong>Free of charge</strong></li>
                                <li>Date transfers requested 7-14 days before the trip: <strong>₹500 transfer fee</strong></li>
                                <li>Date transfers within 7 days: <strong>Not permitted</strong></li>
                            </ul>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">No-Show Policy</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                If you fail to show up at the designated pickup point without prior notice, no refund will be provided.
                                Please ensure you inform us if you're running late.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">Refund Processing</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                All eligible refunds will be processed within <strong>7-10 business days</strong> from the date of cancellation approval.
                                Refunds will be credited to the original payment method used during booking.
                            </p>

                            <h2 className="text-2xl font-bold text-brand-black font-serif mb-4">Special Circumstances</h2>
                            <p className="text-brand-black/70 mb-6 leading-relaxed">
                                We understand that sometimes emergencies happen. In cases of medical emergencies or bereavement,
                                please contact us with relevant documentation, and we will do our best to accommodate your situation.
                            </p>

                            <div className="bg-brand-olive/10 p-6 rounded-lg border border-brand-olive/30 mt-8">
                                <h3 className="font-bold text-brand-black mb-2 flex items-center gap-2">
                                    <AlertCircle size={20} className="text-brand-olive" /> Important Note
                                </h3>
                                <p className="text-brand-black/70 text-sm">
                                    We highly recommend purchasing travel insurance that covers trip cancellation, medical emergencies,
                                    and personal belongings. This will protect you in unforeseen circumstances.
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-brand-olive/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-brand-olive font-bold hover:text-brand-black transition"
                            >
                                <ArrowLeft size={18} /> Back to Home
                            </Link>
                            <Link
                                to="/contact"
                                className="text-sm text-brand-black/60 hover:text-brand-olive transition"
                            >
                                Have questions? Contact us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default CancellationPolicy;
