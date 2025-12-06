import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { BlogPost } from '../types';
import { sanitizeHtml } from '../utils/security';
import SEO from '../components/SEO';

const BlogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<BlogPost | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
        api.getBlogById(id).then(data => {
            setBlog(data);
            setLoading(false);
        });
    } else {
        setLoading(false);
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-purple"></div>
          </div>
      );
  }

  if (!blog) {
      return (
          <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <div className="flex-grow flex items-center justify-center">
                  <div className="text-center">
                      <h2 className="text-2xl font-bold text-gray-900">Article not found</h2>
                      <Link to="/blogs" className="mt-4 inline-flex items-center gap-2 text-brand-purple hover:underline">
                          <ArrowLeft size={16} /> Back to Blog
                      </Link>
                  </div>
              </div>
              <Footer />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO 
        title={blog.title} 
        description={blog.metaDescription || blog.title} 
        keywords={blog.tags}
        image={blog.imageUrl}
      />
      <Navbar />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/blogs" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand-purple mb-8 transition-colors">
            <ArrowLeft size={18} /> Back to all articles
        </Link>

        {/* Header */}
        <div className="mb-8">
            <span className="inline-block bg-brand-purple/10 text-brand-purple px-3 py-1 rounded-full text-sm font-bold mb-4">
                {blog.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                {blog.title}
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-8">
                <div className="flex items-center gap-4">
                    {blog.authorAvatar && (
                        <img src={blog.authorAvatar} alt={blog.author} className="w-12 h-12 rounded-full border border-gray-100" />
                    )}
                    <div>
                        <p className="font-bold text-gray-900">{blog.author || 'Wheel to Wilderness'}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {blog.date}</span>
                            {blog.readTime && <span className="flex items-center gap-1"><Clock size={14} /> {blog.readTime}</span>}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 mr-2">Share:</span>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 transition">
                        <Facebook size={18} />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-400 transition">
                        <Twitter size={18} />
                    </button>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-700 transition">
                        <Linkedin size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* Hero Image */}
        <div className="rounded-2xl overflow-hidden mb-12 shadow-lg h-[400px]">
            <img src={blog.imageUrl} alt={blog.title} className="w-full h-full object-cover" />
        </div>

        {/* Content with Security Sanitization */}
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-brand-darkPurple prose-a:text-brand-orange prose-a:no-underline hover:prose-a:underline text-gray-700">
             {blog.content ? (
                 <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }} />
             ) : (
                 <p>Content unavailable.</p>
             )}
        </div>

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
                {/* Combine Category with Tags if Tags exists, otherwise just default tags */}
                {(blog.tags && blog.tags.length > 0 ? blog.tags : ['Travel', 'Adventure', blog.category]).map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-brand-purple hover:text-white transition cursor-pointer">
                        <Tag size={12} /> {tag}
                    </span>
                ))}
            </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogDetails;