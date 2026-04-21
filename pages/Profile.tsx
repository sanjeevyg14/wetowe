import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Mail, Shield, User as UserIcon, Edit2, Save, X, Camera } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
      name: user?.name || '',
      avatar: user?.avatar || ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" />;

  const handleSave = async () => {
      setSaveLoading(true);
      try {
          const updated = await api.updateProfile({
              name: formData.name,
              avatar: formData.avatar
          });
          updateUser(updated);
          setIsEditing(false);
          setImageError(false); // Reset error state on successful save
      } catch (error) {
          console.error("Failed to update profile", error);
          alert("Failed to update profile");
      } finally {
          setSaveLoading(false);
      }
  };

  const handleImageError = () => {
      setImageError(true);
  };

  const displayAvatar = imageError 
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3A4D39&color=F9F5EB`
      : (isEditing ? formData.avatar : user.avatar);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="max-w-4xl mx-auto w-full px-4 py-12 flex-grow">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="bg-brand-olive h-32 relative">
               <div className="absolute -bottom-12 left-8 group">
                   <div className="relative">
                        <img 
                            src={displayAvatar} 
                            onError={handleImageError}
                            alt={user.name} 
                            className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white object-cover"
                        />
                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                                <Camera className="text-white opacity-75" size={24} />
                            </div>
                        )}
                   </div>
               </div>
           </div>
           
           <div className="pt-16 px-8 pb-8">
               <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                   <div className="flex-1 w-full">
                       {isEditing ? (
                           <div className="space-y-4 max-w-md animate-fade-in-up">
                               <div>
                                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                                   <input 
                                     type="text" 
                                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-olive focus:border-transparent outline-none transition"
                                     value={formData.name}
                                     onChange={e => setFormData({...formData, name: e.target.value})}
                                     placeholder="Your full name"
                                   />
                               </div>
                               <div>
                                   <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Avatar URL</label>
                                   <input 
                                     type="text" 
                                     className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-olive focus:border-transparent outline-none text-sm font-mono text-gray-600 transition"
                                     value={formData.avatar}
                                     onChange={e => {
                                         setFormData({...formData, avatar: e.target.value});
                                         setImageError(false); // Reset error when typing new URL
                                     }}
                                     placeholder="https://example.com/avatar.jpg"
                                   />
                                   <p className="text-[10px] text-gray-400 mt-1">Paste a direct link to an image (JPG, PNG).</p>
                               </div>
                           </div>
                       ) : (
                           <div className="animate-fade-in">
                               <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                               <p className="text-gray-500 flex items-center gap-1">
                                   <Shield size={12} className="text-brand-olive"/> {user.role === 'admin' ? 'Administrator' : 'Explorer'}
                               </p>
                           </div>
                       )}
                   </div>
                   
                   <div className="flex gap-3 shrink-0">
                       {isEditing ? (
                           <>
                               <button 
                                   onClick={() => {
                                       setIsEditing(false);
                                       setFormData({ name: user.name, avatar: user.avatar || '' });
                                       setImageError(false);
                                   }}
                                   className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition flex items-center gap-2"
                               >
                                   <X size={16}/> Cancel
                               </button>
                               <button 
                                   onClick={handleSave}
                                   disabled={saveLoading}
                                   className="bg-brand-olive text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-sage transition flex items-center gap-2 disabled:opacity-70 shadow-md"
                               >
                                   <Save size={16}/> {saveLoading ? 'Saving...' : 'Save Changes'}
                               </button>
                           </>
                       ) : (
                           <>
                               <button 
                                   onClick={() => {
                                       setFormData({ name: user.name, avatar: user.avatar || '' });
                                       setIsEditing(true);
                                   }}
                                   className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition flex items-center gap-2"
                               >
                                   <Edit2 size={16}/> Edit Profile
                               </button>
                               <Link to="/my-bookings" className="bg-brand-olive text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-sage transition shadow-sm">
                                   My Bookings
                               </Link>
                           </>
                       )}
                   </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                   <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4 transition hover:border-brand-olive/20">
                       <div className="bg-white p-3 rounded-full text-brand-olive shadow-sm">
                           <Mail size={20} />
                       </div>
                       <div>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email Address</p>
                           <p className="text-gray-900 font-medium">{user.email}</p>
                       </div>
                   </div>
                   <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-4 transition hover:border-brand-olive/20">
                       <div className="bg-white p-3 rounded-full text-brand-olive shadow-sm">
                           <Shield size={20} />
                       </div>
                       <div>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account Status</p>
                           <p className="text-gray-900 font-medium flex items-center gap-2">
                               <span className="w-2 h-2 rounded-full bg-green-500"></span> Active
                           </p>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;