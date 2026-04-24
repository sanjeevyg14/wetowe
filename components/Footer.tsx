import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-black text-brand-cream pt-16 pb-8 border-t-4 border-brand-olive">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Newsletter Section */}
        <div className="bg-brand-olive/10 p-8 rounded-lg border border-brand-olive/30 flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-2 font-serif text-brand-cream">Join the expedition.</h3>
            <p className="text-brand-cream/60">Travel tales and exclusive routes sent to your inbox.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="px-4 py-3 rounded-md bg-brand-black border border-brand-olive/50 text-brand-cream w-full md:w-80 focus:outline-none focus:border-brand-sage placeholder-brand-cream/30"
            />
            <button className="bg-brand-olive text-brand-cream p-3 rounded-md hover:bg-brand-sage transition border border-transparent">
              <Send size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">About</h4>
            <ul className="space-y-2 text-brand-cream/70 text-sm">
              <li><Link to="/our-story" className="hover:text-brand-olive transition">Our Story</Link></li>
              <li><Link to="/team" className="hover:text-brand-olive transition">Team</Link></li>
              <li><Link to="/contact" className="hover:text-brand-olive transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Explore</h4>
            <ul className="space-y-2 text-brand-cream/70 text-sm">
              <li><Link to="/destinations" className="hover:text-brand-olive transition">All Trips</Link></li>
              <li><Link to="/destinations?duration=weekend" className="hover:text-brand-olive transition">Weekend Getaways</Link></li>
              <li><Link to="/destinations?duration=long" className="hover:text-brand-olive transition">Long Expeditions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-2 text-brand-cream/70 text-sm">
              <li><Link to="/contact" className="hover:text-brand-olive transition">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-brand-olive transition">Contact Us</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-brand-olive transition">Cancellation Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Follow</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-olive hover:text-brand-cream transition"><Facebook size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-olive hover:text-brand-cream transition"><Twitter size={20} /></a>
              <a href="https://instagram.com/wheelstowilderness" target="_blank" rel="noopener noreferrer" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-olive hover:text-brand-cream transition"><Instagram size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-olive hover:text-brand-cream transition"><Youtube size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-brand-cream/40">
          <p>&copy; 2024 Wheels to Wilderness. Est. Bangalore.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="hover:text-brand-cream">Terms & Conditions</Link>
            <Link to="/cancellation-policy" className="hover:text-brand-cream">Cancellation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;