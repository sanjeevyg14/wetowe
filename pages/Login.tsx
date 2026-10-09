import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const loggedInUser = await login(email, password);
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');
      
      let safeRedirect = '/profile';
      if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
          safeRedirect = redirect;
      } else if (loggedInUser?.role === 'admin') {
          safeRedirect = '/admin';
      }
      
      navigate(safeRedirect);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
            <Link to="/" className="inline-flex flex-col items-center mb-6 group">
              <div className="flex items-center gap-2">
                <img 
                  src="/wetowe1.png" 
                  alt="Wheel to Wilderness" 
                  className="h-20 w-15 rounded-md object-cover shadow-sm group-hover:rotate-3 transition-transform duration-300"
                />
                <span className="font-bold text-2xl tracking-tight text-brand-black leading-none uppercase">
                    Wheel to <span className="text-brand-olive">Wilderness</span>
                </span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-brand-black font-serif">Welcome back</h2>
            <p className="text-brand-black/50 mt-2">Log in to manage your bookings and wishlist.</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-xl border border-brand-olive/10">
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Email Address</label>
                    <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-transparent transition bg-brand-cream/30 text-gray-900"
                        placeholder="user@test.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest">Password</label>
                        <a href="#" className="text-xs text-brand-olive font-bold hover:underline">Forgot?</a>
                    </div>
                    <input 
                        type="password" 
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-transparent transition bg-brand-cream/30 text-gray-900"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button 
                  disabled={isLoading}
                  className="w-full bg-brand-olive text-brand-cream font-bold py-3.5 rounded-md hover:bg-brand-black transition shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70 uppercase tracking-widest text-sm"
                >
                    {isLoading ? <Loader className="animate-spin" size={20}/> : (
                      <>Log In <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
                    )}
                </button>
            </form>
        </div>

        <p className="text-center mt-8 text-brand-black/60 text-sm">
            Don't have an account? <Link to="/signup" className="text-brand-olive font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;