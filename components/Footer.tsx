import React from 'react';
import { Instagram, Youtube } from 'lucide-react';
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
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition">
                <svg viewBox="0 0 192 192" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"><path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.881 72.2328C81.6116 63.5383 90.6052 61.6848 97.2286 61.6848C97.3051 61.6848 97.3819 61.6848 97.4576 61.6855C105.707 61.7381 111.932 64.1366 115.961 68.814C118.893 72.2193 120.854 76.925 121.825 82.8638C114.511 81.6207 106.601 81.2385 98.145 81.7233C74.3247 83.0954 59.0111 96.9879 60.0396 116.292C60.5615 126.084 65.4397 134.508 73.775 140.011C80.8224 144.663 89.899 146.938 99.3323 146.423C111.79 145.74 121.563 140.987 128.381 132.296C133.559 125.696 136.834 117.143 138.28 106.366C144.217 109.949 148.617 114.664 151.047 120.332C155.179 129.967 155.42 145.8 142.501 158.708C131.182 170.016 117.576 174.908 97.0135 175.059C74.2042 174.89 56.9538 167.575 45.7381 153.317C35.2355 139.966 29.8077 120.682 29.6052 96C29.8077 71.3178 35.2355 52.0336 45.7381 38.6827C56.9538 24.4249 74.2039 17.11 97.0132 16.9405C119.988 17.1113 137.539 24.4614 149.184 38.788C154.894 45.8136 159.199 54.6488 162.037 64.9503L178.184 60.6422C174.744 47.9622 169.331 37.0357 161.965 27.974C147.036 9.60668 125.202 0.195148 97.0695 0H96.9569C68.8816 0.19445 47.2921 9.6418 32.7883 28.0793C19.8819 44.4864 13.2244 67.3157 13.0007 95.9325L13 96L13.0007 96.0675C13.2244 124.684 19.8819 147.514 32.7883 163.921C47.2921 182.358 68.8816 191.806 96.9569 192H97.0695C122.03 191.827 139.624 185.292 154.118 170.811C173.081 151.866 172.51 128.119 166.26 113.541C160.755 100.704 151.815 93.6391 141.537 88.9883ZM98.4405 129.507C88.0005 130.095 77.1544 125.409 76.6196 115.372C76.2232 107.93 81.9158 99.626 99.0812 98.6368C101.047 98.5234 102.976 98.468 104.871 98.468C111.106 98.468 116.939 99.0737 122.242 100.233C120.264 124.935 108.662 128.946 98.4405 129.507Z"></path></svg>
              </a>
              <a href="https://instagram.com/wheelstowilderness" target="_blank" rel="noopener noreferrer" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition"><Instagram size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition"><Youtube size={20} /></a>
              <a href="#" className="bg-brand-cream/10 p-2 rounded-full hover:bg-brand-cream hover:text-brand-black transition">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .883.175 1.19.46 1.2-.845 2.833-1.405 4.626-1.49l.923-4.312a.24.24 0 0 1 .29-.187l2.81.593c.24-.311.603-.526 1.014-.526zM9.544 13.916c-.958 0-1.734.776-1.734 1.734 0 .958.776 1.734 1.734 1.734.958 0 1.734-.776 1.734-1.734 0-.958-.776-1.734-1.734-1.734zm4.908 0c-.958 0-1.734.776-1.734 1.734 0 .958.776 1.734 1.734 1.734.958 0 1.734-.776 1.734-1.734 0-.958-.776-1.734-1.734-1.734zm-2.454 4.298c-1.503 0-2.825-.544-3.41-1.328l-.683.655c.783.99 2.378 1.637 4.093 1.637 1.716 0 3.31-.647 4.094-1.637l-.684-.655c-.584.784-1.906 1.328-3.41 1.328z"/></svg>
              </a>
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