import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
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

  // Default organization structured data
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: BASE_URL,
    logo: `${BASE_URL}/wetowe1.png`,
    sameAs: [
      'https://instagram.com/wheelstowilderness',
      'https://facebook.com/wheelstowilderness',
      'https://twitter.com/wheelstowild'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9606499422',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi']
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'Karnataka'
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
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

// Helper function to generate Trip structured data
export const generateTripSchema = (trip: {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  location: string;
  duration: string;
  slug: string;
  rating?: number;
  reviewCount?: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'TouristTrip',
  name: trip.title,
  description: trip.description,
  image: trip.imageUrl,
  touristType: 'Adventure Travelers',
  offers: {
    '@type': 'Offer',
    price: trip.price,
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: `https://wheelstowilderness.in/trip/${trip.slug}`
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
      ratingValue: trip.rating,
      reviewCount: trip.reviewCount || 10,
      bestRating: 5,
      worstRating: 1
    }
  })
});

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
