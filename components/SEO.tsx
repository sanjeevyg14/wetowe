import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object | object[];
  noindex?: boolean;
}

const SITE_NAME = 'Wheels to Wilderness';
const DEFAULT_DESCRIPTION = 'Discover handpicked weekend getaways, trekking spots, and hidden gems across India. Book curated travel experiences with Wheels to Wilderness.';
const DEFAULT_IMAGE = 'https://wheelstowilderness.in/og-image.jpg';
const BASE_URL = 'https://wheelstowilderness.in';

const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = 'travel, trips, weekend getaway, trekking, adventure, India travel, group tours, Gokarna, Hampi, Pondicherry, Wayanad',
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  structuredData,
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - Let's Get Lost Together`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  // Default organization structured data (Knowledge Panel)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/banner.jpg`,
    telephone: '+919606499422',
    email: 'experiences@wheelstowilderness.in',
    priceRange: '₹₹',
    sameAs: [
      'https://www.instagram.com/wheelstowilderness'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+919606499422',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi']
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Bangalore',
      addressRegion: 'Karnataka',
      addressCountry: 'IN'
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@wheelstowild" />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content={SITE_NAME} />
      <meta name="geo.region" content="IN-KA" />
      <meta name="geo.placename" content="Bangalore" />

      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      {/* Custom Structured Data */}
      {structuredData && (
        Array.isArray(structuredData)
          ? structuredData.map((data, idx) => (
              <script key={idx} type="application/ld+json">
                {JSON.stringify(data)}
              </script>
            ))
          : (
            <script type="application/ld+json">
              {JSON.stringify(structuredData)}
            </script>
          )
      )}
    </Helmet>
  );
};

export default SEO;

// Helper function to generate Trip structured data (TouristTrip + Product dual-type)
export const generateTripSchema = (trip: {
  title: string;
  description: string;
  imageUrl: string;
  gallery?: string[];
  price: number;
  location: string;
  duration: string;
  slug: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
}) => {
  // Derive touristType array from category
  const touristTypes: string[] = ['Adventure'];
  const cat = (trip.category || '').toLowerCase();
  if (cat.includes('weekend') || cat.includes('getaway')) touristTypes.push('Weekend Getaway');
  if (cat.includes('trek')) touristTypes.push('Trekking');
  if (cat.includes('beach')) touristTypes.push('Beach Holiday');
  if (cat.includes('heritage')) touristTypes.push('Heritage Tour');
  if (touristTypes.length === 1) touristTypes.push('Weekend Getaway'); // default fallback

  // Build image array
  const images: string[] = [trip.imageUrl];
  if (trip.gallery && trip.gallery.length > 0) {
    trip.gallery.slice(0, 4).forEach(img => {
      if (!images.includes(img)) images.push(img);
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': ['TouristTrip', 'Product'],
    name: trip.title,
    description: trip.description,
    image: images,
    touristType: touristTypes,
    offers: {
      '@type': 'Offer',
      price: String(trip.price),
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      validFrom: `${new Date().getFullYear()}-01-01`,
      url: `https://wheelstowilderness.in/trip/${trip.slug}`
    },
    provider: {
      '@type': 'TravelAgency',
      name: 'Wheels to Wilderness',
      url: 'https://wheelstowilderness.in'
    },
    itinerary: {
      '@type': 'ItemList',
      numberOfItems: parseInt(trip.duration) || 2,
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: trip.location
      }]
    },
    ...(trip.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: String(trip.rating),
        reviewCount: String(trip.reviewCount || 10),
        bestRating: '5',
        worstRating: '1'
      }
    })
  };
};

// Helper for breadcrumb structured data
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://wheelstowilderness.in${item.url}`
  }))
});

// Helper for FAQ structured data
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(faq => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer
    }
  }))
});
