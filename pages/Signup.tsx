import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, AlertCircle, Loader } from 'lucide-react';
import { authService } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';

const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const fullName = `${firstName} ${lastName}`.trim();
        if (!fullName) throw new Error("Name is required");
        
        const user = await authService.register(fullName, email, password);
        updateUser(user);
        navigate('/'); // Redirect to home on success
    } catch (err: any) {
        setError(err.message || "Failed to create account");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
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
            <h2 className="text-3xl font-bold text-brand-black font-serif">Join the tribe</h2>
            <p className="text-brand-black/50 mt-2">Create an account to book trips and meet travellers.</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-xl border border-brand-olive/10">
            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">First Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-transparent transition bg-brand-cream/30"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Last Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-transparent transition bg-brand-cream/30"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Email Address</label>
                    <input 
                        type="email" 
                        required
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-transparent transition bg-brand-cream/30"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-brand-black/50 uppercase tracking-widest mb-2">Password</label>
                    <input 
                        type="password" 
                        required
                        minLength={6}
                        className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-transparent transition bg-brand-cream/30"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Must be at least 6 characters</p>
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" required className="w-4 h-4 text-brand-olive border-gray-300 rounded focus:ring-brand-olive"/>
                    <span className="text-sm text-gray-500">I agree to the <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a></span>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-brand-olive text-brand-cream font-bold py-3.5 rounded-md hover:bg-brand-black transition shadow-lg flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 uppercase tracking-widest text-sm"
                >
                    {isLoading ? <Loader className="animate-spin" size={20}/> : (
                        <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/></>
                    )}
                </button>
            </form>
        </div>

        <p className="text-center mt-8 text-brand-black/60 text-sm">
            Already have an account? <Link to="/login" className="text-brand-olive font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;