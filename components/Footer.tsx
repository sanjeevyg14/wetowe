import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-black text-white pt-16 pb-8 border-t-4 border-brand-olive">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">About</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li><Link to="/our-story" className="hover:text-brand-cream transition">Our Story</Link></li>
              <li><Link to="/team" className="hover:text-brand-cream transition">Team</Link></li>
              <li><Link to="/contact" className="hover:text-brand-cream transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Explore</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li><Link to="/destinations" className="hover:text-brand-cream transition">All Trips</Link></li>
              <li><Link to="/destinations?duration=weekend" className="hover:text-brand-cream transition">Weekend Getaways</Link></li>
              <li><Link to="/destinations?duration=long" className="hover:text-brand-cream transition">Long Expeditions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li><Link to="/contact" className="hover:text-brand-cream transition">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-brand-cream transition">Contact Us</Link></li>
              <li><Link to="/cancellation-policy" className="hover:text-brand-cream transition">Cancellation Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Follow</h4>
            <div className="flex space-x-4">
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition"><Facebook size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition"><Twitter size={20} /></a>
              <a href="https://instagram.com/wheelstowilderness" target="_blank" rel="noopener noreferrer" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition"><Instagram size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition"><Youtube size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/70">
          <p>&copy; 2024 Wheels to Wilderness. Est. Bangalore.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="hover:text-brand-cream text-white/80">Terms & Conditions</Link>
            <Link to="/cancellation-policy" className="hover:text-brand-cream text-white/80">Cancellation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;