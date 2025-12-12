import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Send } from 'lucide-react';

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
              <li><a href="#" className="hover:text-brand-olive transition">Our Story</a></li>
              <li><a href="#" className="hover:text-brand-olive transition">Team</a></li>
              <li><a href="#" className="hover:text-brand-olive transition">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Experiences</h4>
            <ul className="space-y-2 text-brand-cream/70 text-sm">
              <li><a href="#" className="hover:text-brand-olive transition">Sound Healing</a></li>
              <li><a href="#" className="hover:text-brand-olive transition">Forest trail</a></li>
              <li><a href="#" className="hover:text-brand-olive transition">French Expedition</a></li>
              <li><a href="#" className="hover:text-brand-olive transition">Offbeat experinces</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-2 text-brand-cream/70 text-sm">
              <li><a href="#" className="hover:text-brand-olive transition">Help Center</a></li>
              <li><a href="#" className="hover:text-brand-olive transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-olive transition">Guarantee</a></li>
              <li><a href="#" className="hover:text-brand-olive transition">Cancellation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-4 text-brand-olive uppercase tracking-wider text-sm">Follow</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-olive hover:text-brand-cream transition"><Facebook size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-olive hover:text-brand-cream transition"><Twitter size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-olive hover:text-brand-cream transition"><Instagram size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-olive hover:text-brand-cream transition"><Youtube size={20} /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-cream/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-brand-cream/40">
          <p>&copy; 2024 Wheels to Wilderness. Est. Bangalore.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-brand-cream">Privacy</a>
            <a href="#" className="hover:text-brand-cream">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;