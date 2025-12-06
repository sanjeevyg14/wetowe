import React from 'react';
import { Star, MapPin, ArrowRight } from 'lucide-react';
import { Trip } from '../types';
import { Link } from 'react-router-dom';

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  // Use slug if available, otherwise fallback to ID
  const linkTarget = trip.slug ? `/trip/${trip.slug}` : `/trip/${trip.id}`;

  return (
    <Link to={linkTarget} className="group block h-full">
      <div className="bg-brand-cream rounded-lg overflow-hidden border border-brand-olive/20 hover:border-brand-olive transition-all duration-300 flex flex-col h-full hover:-translate-y-1">
        <div className="relative h-56 overflow-hidden">
          <img 
            src={trip.imageUrl} 
            alt={trip.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[20%] group-hover:grayscale-0"
          />
          <div className="absolute top-3 left-3 bg-brand-cream/90 backdrop-blur-md px-2 py-1 rounded-sm flex items-center gap-1 border border-brand-olive/10">
            <Star size={12} className="text-brand-olive fill-brand-olive" />
            <span className="text-xs font-bold text-brand-black">{trip.rating}</span>
          </div>
          <div className="absolute bottom-3 right-3 bg-brand-olive text-brand-cream text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
            Selling Fast
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-lg text-brand-black line-clamp-2 leading-tight group-hover:text-brand-olive transition-colors font-serif">
              {trip.title}
            </h3>
          </div>
          
          <div className="flex items-center text-brand-black/60 text-sm mb-4">
            <MapPin size={14} className="mr-1 text-brand-olive" />
            {trip.location}
          </div>

          <div className="mt-auto pt-4 border-t border-brand-olive/10 flex items-center justify-between">
            <div className="text-xs text-brand-black/70">
              <p>Starting at</p>
              <p className="font-bold text-lg text-brand-olive">₹{trip.price.toLocaleString()}</p>
            </div>
            {/* Using div instead of button since it's inside a Link anchor tag */}
            <div className="px-4 py-2 rounded-md border border-brand-olive text-brand-olive text-sm font-bold group-hover:bg-brand-olive group-hover:text-brand-cream transition-all duration-300 flex items-center gap-2">
              Explore 
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TripCard;