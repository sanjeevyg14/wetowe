import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, image }) => {
  useEffect(() => {
    // Update Title
    document.title = `${title} | Wheel to Wilderness`;

    // Update Meta Tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'Wheel to Wilderness - Lets get lost together.');
    } else {
        const meta = document.createElement('meta');
        meta.name = "description";
        meta.content = description || 'Wheel to Wilderness - Lets get lost together.';
        document.head.appendChild(meta);
    }

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string) => {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute('name', name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    };

    if (keywords && keywords.length > 0) {
        updateMeta('keywords', keywords.join(', '));
    }

    // Open Graph
    updateMeta('og:title', title);
    if(description) updateMeta('og:description', description);
    if(image) updateMeta('og:image', image);

  }, [title, description, keywords, image]);

  return null;
};

export default SEO;
