import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { ArrowRight, Tag, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import SEO from '../components/SEO';

const Blogs: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
        try {
            const data = await api.getBlogs();
            setBlogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    loadBlogs();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEO title="Travel Blog" description="Read inspiring travel stories, tips, and guides from the Wheel to Wilderness community." />
      <Navbar />
      
      {/* Blog Header */}
      <div className="bg-brand-purple text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-brand-orange font-bold tracking-widest uppercase text-sm mb-3 block">Travel Log</span>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Stories from the Road</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Travel tips, destination guides, and inspiring stories from our community of wanderers.
          </p>
          <Link to="/create-blog" className="inline-flex items-center gap-2 bg-white text-brand-purple px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">
             <PenTool size={18}/> Write a Story
          </Link>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[1, 2, 3].map((i) => (
                    <div key={`placeholder-${i}`} className="flex flex-col group h-full">
                    <div className="rounded-2xl overflow-hidden h-64 mb-6 bg-gray-200 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                ))}
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog) => (
                <Link key={blog.id} to={`/blog/${blog.id}`} className="flex flex-col group h-full">
                <div className="rounded-2xl overflow-hidden h-64 mb-6 relative shadow-sm group-hover:shadow-xl transition-all duration-300">
                    <img 
                    src={blog.imageUrl} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold text-brand-purple flex items-center gap-1">
                    <Tag size={12} /> {blog.category}
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                    <div className="text-sm text-gray-500 mb-2">{blog.date}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-brand-orange transition-colors">
                    {blog.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
                    {blog.content?.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                    <div className="text-brand-purple font-bold flex items-center gap-2 mt-auto group-hover:translate-x-2 transition-transform self-start">
                    Read Article <ArrowRight size={18} />
                    </div>
                </div>
                </Link>
            ))}
            </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Blogs;