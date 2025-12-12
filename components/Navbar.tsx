import React, { useState } from 'react';
import { Menu, X, User as UserIcon, LogOut, Briefcase } from 'lucide-react';
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
                  <span className="font-bold text-lg md:text-xl tracking-tight text-brand-black leading-none uppercase">
                    Wheels to <span className="text-brand-olive">Wilderness</span>
                  </span>
                  <span className="text-[10px] font-medium text-brand-sage tracking-widest uppercase mt-0.5">
                    Lets's Get Lost Together
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/destinations" className="text-brand-black/80 hover:text-brand-olive font-medium transition tracking-wide text-sm uppercase">Destinations</Link>
            
            {isAdmin && (
               <Link to="/admin" className="text-brand-olive font-bold flex items-center gap-1 text-sm uppercase tracking-wide">
                 Admin
               </Link>
            )}
            
            {!isAuthenticated ? (
              <Link to="/login" className="flex items-center gap-2 border-2 border-brand-black rounded-lg px-5 py-2 hover:bg-brand-black hover:text-brand-cream transition group">
                <span className="text-sm font-bold tracking-wide uppercase">Log in</span>
                <UserIcon size={16} className="group-hover:text-brand-cream transition-colors" />
              </Link>
            ) : (
              <div className="relative group">
                <button className="flex items-center gap-2 hover:bg-brand-beige rounded-lg pl-2 pr-4 py-1.5 transition">
                  <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-md object-cover border border-brand-olive/20" />
                  <span className="text-sm font-semibold text-brand-black">{user?.name}</span>
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-brand-cream rounded-md shadow-xl border border-brand-olive/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                  <div className="py-2">
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-black hover:bg-brand-beige">
                       <UserIcon size={16}/> Profile
                    </Link>
                    <Link to="/my-bookings" className="flex items-center gap-2 px-4 py-2 text-sm text-brand-black hover:bg-brand-beige">
                       <Briefcase size={16}/> My Bookings
                    </Link>
                    <div className="border-t border-brand-olive/10 my-1"></div>
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
             <button onClick={() => setIsOpen(!isOpen)} className="text-brand-black hover:text-brand-olive focus:outline-none">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-olive/10 absolute w-full shadow-lg h-screen z-50">
          <div className="px-4 pt-4 pb-6 space-y-2">
            
            {isAuthenticated && (
              <div className="flex items-center gap-3 p-3 bg-brand-beige rounded-lg mb-4">
                 <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-md object-cover" />
                 <div>
                   <p className="font-bold text-brand-black">{user?.name}</p>
                   <p className="text-xs text-brand-black/60">{user?.email}</p>
                 </div>
              </div>
            )}

            <Link to="/destinations" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-brand-black hover:bg-brand-beige">Destinations</Link>
            
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-brand-olive bg-brand-olive/10">Admin</Link>
            )}

            {isAuthenticated && (
              <>
                 <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-brand-black hover:bg-brand-beige">Profile</Link>
                 <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-brand-black hover:bg-brand-beige">My Bookings</Link>
              </>
            )}
            
            <div className="mt-6 px-3">
               {!isAuthenticated ? (
                 <Link to="/login" className="block w-full bg-brand-olive text-brand-cream text-center font-bold py-3 rounded-lg uppercase tracking-wide">Log in</Link>
               ) : (
                 <button onClick={handleLogout} className="block w-full border border-red-200 text-red-700 text-center font-bold py-3 rounded-lg hover:bg-red-50">Log Out</button>
               )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;