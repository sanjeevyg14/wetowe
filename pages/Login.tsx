import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/profile');
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
                  src="https://ui-avatars.com/api/?name=Wheel+to+Wilderness&background=3A4D39&color=F9F5EB&rounded=false&size=128" 
                  alt="Wheel to Wilderness" 
                  className="h-10 w-10 rounded-md object-cover shadow-sm group-hover:rotate-3 transition-transform duration-300"
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
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-transparent transition bg-brand-cream/30"
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
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-transparent transition bg-brand-cream/30"
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

            <div className="mt-6">
                <p className="text-xs text-center text-gray-400 mb-4 uppercase tracking-wider">Demo Credentials</p>
                <div className="flex gap-2">
                   <button onClick={() => {setEmail('user@test.com'); setPassword('password123');}} className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 py-2 rounded text-gray-600 border border-gray-200 font-mono">user@test.com</button>
                   <button onClick={() => {setEmail('admin@test.com'); setPassword('password123');}} className="flex-1 text-xs bg-gray-50 hover:bg-gray-100 py-2 rounded text-gray-600 border border-gray-200 font-mono">admin@test.com</button>
                </div>
            </div>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500 text-xs">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                    <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Google
                    </button>
                    <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Facebook
                    </button>
                </div>
            </div>
        </div>

        <p className="text-center mt-8 text-brand-black/60 text-sm">
            Don't have an account? <Link to="/signup" className="text-brand-olive font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;