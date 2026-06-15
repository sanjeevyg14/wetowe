import React, { useState } from 'react';
import { Menu, X, LogOut, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="bg-brand-cream sticky top-0 z-50 border-b border-brand-olive/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="group">
              <div className="flex items-center gap-3">
                <img 
                  src="/wetowe1.png" 
                  alt="Wheel to Wilderness" 
                  className="h-35 w-20 rounded-md group-hover:rotate-3 transition-transform duration-300"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-lg md:text-xl tracking-tight text-brand-olive leading-none uppercase font-sans">
                    Wheels to Wilderness
                  </span>
                  <span className="text-[10px] font-medium text-brand-olive/60 tracking-widest uppercase mt-0.5">
                    Lets's Get Lost Together
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/destinations" className="text-brand-olive/80 hover:text-brand-olive font-medium transition tracking-wide text-sm uppercase">Destinations</Link>
            
            {isAdmin && (
               <Link to="/admin" className="text-brand-beige font-bold flex items-center gap-1 text-sm uppercase tracking-wide">
                 Admin
               </Link>
            )}

            {isAdmin && isAuthenticated && (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:bg-brand-cream/10 rounded-lg pl-2 pr-4 py-1.5 transition">
                  <span className="text-sm font-semibold text-brand-olive">{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl border border-brand-beige/20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                  <div className="py-2">
                    <Link to="/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-black hover:bg-brand-beige">
                       <Briefcase size={16}/> Bookings
                    </Link>
                    <div className="border-t border-brand-beige/50 my-1"></div>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left">
                       <LogOut size={16}/> Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
             <button onClick={() => setIsOpen(!isOpen)} className="text-brand-olive hover:text-brand-beige focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-olive/10 absolute w-full shadow-lg h-screen z-50">
          <div className="px-4 pt-4 pb-6 space-y-2">
            
            {isAdmin && isAuthenticated && (
              <div className="flex items-center gap-3 p-3 bg-brand-cream/50 rounded-lg mb-4 border border-brand-olive/10">
                 <div>
                   <p className="font-bold text-brand-olive">{user?.name}</p>
                   <p className="text-xs text-brand-olive/60">{user?.email}</p>
                 </div>
              </div>
            )}

            <Link to="/destinations" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-brand-olive hover:bg-brand-cream/50">Destinations</Link>
            
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-brand-beige bg-brand-cream/30">Admin</Link>
            )}

            {isAdmin && isAuthenticated && (
              <>
                 <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-brand-olive hover:bg-brand-cream/50">My Bookings</Link>
              </>
            )}
            
            <div className="mt-6 px-3">
               {isAdmin && isAuthenticated ? (
                 <button onClick={handleLogout} className="block w-full border border-red-400/50 text-red-300 text-center font-bold py-3 rounded-lg hover:bg-red-900/20">Log Out</button>
               ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;