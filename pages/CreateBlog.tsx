import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { PenTool, Image, Save, ArrowLeft, Loader } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import SEO from '../components/SEO';

const CreateBlog: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Travel Tips',
    imageUrl: '',
    content: '',
    metaDescription: '',
    tags: ''
  });

  if (!isAuthenticated || !user) {
      return <Navigate to="/login" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const wordCount = formData.content.split(/\s+/).length;
        const readTime = `${Math.ceil(wordCount / 200)} min read`;

        await api.createBlog({
            title: formData.title,
            category: formData.category,
            imageUrl: formData.imageUrl || 'https://picsum.photos/800/600',
            content: formData.content,
            author: user.name,
            authorId: user.id,
            authorAvatar: user.avatar,
            readTime: readTime,
            metaDescription: formData.metaDescription,
            tags: formData.tags.split(',').map(t => t.trim())
        });

        alert("Blog submitted successfully! It will be live after admin approval.");
        navigate('/blogs');
    } catch (error) {
        console.error(error);
        alert("Failed to submit blog. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <SEO title="Write a Story" description="Share your travel experiences with the Wheel to Wilderness community." />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/blogs" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-purple mb-6 transition-colors">
            <ArrowLeft size={18} /> Back to Blogs
        </Link>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-brand-purple p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-2 rounded-lg"><PenTool size={24}/></div>
                    <h1 className="text-2xl font-bold">Write a Story</h1>
                </div>
                <p className="text-purple-100">Share your adventure with the community.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                        placeholder="e.g. My Solo Trip to Gokarna"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                        <select 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:outline-none bg-white"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Travel Tips</option>
                            <option>Destinations</option>
                            <option>Food & Culture</option>
                            <option>Adventure</option>
                            <option>Personal Story</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tags (comma separated)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                            placeholder="e.g. beach, solo, budget"
                            value={formData.tags}
                            onChange={e => setFormData({...formData, tags: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Featured Image URL</label>
                    <div className="relative">
                        <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="url" 
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                            placeholder="https://..."
                            value={formData.imageUrl}
                            onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description (SEO)</label>
                    <input 
                        type="text" 
                        required
                        maxLength={160}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:outline-none"
                        placeholder="A short summary for search engines (max 160 chars)"
                        value={formData.metaDescription}
                        onChange={e => setFormData({...formData, metaDescription: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Content (HTML allowed)</label>
                    <textarea 
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-purple focus:outline-none h-64 font-mono text-sm"
                        placeholder="<p>Start writing your story here...</p>"
                        value={formData.content}
                        onChange={e => setFormData({...formData, content: e.target.value})}
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-2">
                        Note: Simple HTML tags like &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt; are supported. Scripts will be stripped for security.
                    </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-darkPurple transition shadow-lg flex items-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? <Loader className="animate-spin" size={20}/> : <><Save size={20} /> Submit for Review</>}
                    </button>
                </div>
            </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateBlog;