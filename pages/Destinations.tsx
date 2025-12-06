import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TripCard from '../components/TripCard';
import { api } from '../services/api';
import { Trip } from '../types';
import { Search, Filter, MapPin, Calendar, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Destinations: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [searchDate, setSearchDate] = useState(searchParams.get('date') || '');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    api.getTrips().then(data => {
        setTrips(data);
        setLoading(false);
    });
  }, []);

  useEffect(() => {
    const query = searchParams.get('search');
    const dateQuery = searchParams.get('date');
    if (query !== null) setSearchTerm(query);
    if (dateQuery !== null) setSearchDate(dateQuery);
  }, [searchParams]);

  const updateSearch = (term: string, date: string) => {
      setSearchTerm(term);
      setSearchDate(date);
      const params = new URLSearchParams();
      if (term) params.append('search', term);
      if (date) params.append('date', date);
      setSearchParams(params);
  };

  const filters = ['All', 'Beaches', 'Mountains', 'Heritage', 'Trekking'];

  const filteredTrips = trips.filter(trip => {
     const matchesSearch = trip.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           trip.location.toLowerCase().includes(searchTerm.toLowerCase());
     
     // Date Matching Logic
     // Since mock dates are strings like "Dec 8 - Dec 10", we do a simple string inclusion check or always true if no date selected.
     // In a real app, we would parse ISO dates.
     // For this prototype, if a date is selected, we check if any of the trip dates string contains the selected Month (e.g. '2023-12-08' -> 'Dec')
     let matchesDate = true;
     if (searchDate) {
         const dateObj = new Date(searchDate);
         const month = dateObj.toLocaleString('default', { month: 'short' });
         const day = dateObj.getDate();
         // Check if any date string in the trip.dates array contains the month (simple approximation)
         // Or matches if the API returned structured dates.
         matchesDate = trip.dates.some(d => d.includes(month));
     }

     let matchesCategory = true;
     if (activeFilter !== 'All') {
        const content = (trip.title + trip.description).toLowerCase();
        if (activeFilter === 'Beaches') matchesCategory = content.includes('beach') || content.includes('sea');
        if (activeFilter === 'Mountains') matchesCategory = content.includes('hill') || content.includes('mountain');
        if (activeFilter === 'Heritage') matchesCategory = content.includes('heritage') || content.includes('history') || content.includes('temple');
        if (activeFilter === 'Trekking') matchesCategory = content.includes('trek');
     }
     
     return matchesSearch && matchesCategory && matchesDate;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Explore Destinations</h1>
                    <p className="text-gray-500 text-sm">Find the perfect getaway for your weekend.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                        <input 
                            type="text" 
                            placeholder="Search locations..." 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-gray-50"
                            value={searchTerm}
                            onChange={(e) => updateSearch(e.target.value, searchDate)}
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    <div className="relative w-full sm:w-48">
                         <input 
                            type="date" 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent bg-gray-50 text-gray-600"
                            value={searchDate}
                            onChange={(e) => updateSearch(searchTerm, e.target.value)}
                         />
                         <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                    {(searchTerm || searchDate) && (
                        <button 
                            onClick={() => updateSearch('', '')}
                            className="px-3 py-2 text-gray-500 hover:text-red-500 transition border border-gray-200 rounded-xl bg-white"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>
            
            <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
                <span className="text-sm font-bold text-gray-500 mr-2 flex items-center gap-1"><Filter size={14}/> Type:</span>
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                            ${activeFilter === filter ? 'bg-brand-purple text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
         {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-[400px] bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
             </div>
         ) : filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTrips.map((trip) => (
                    <div key={trip.id} className="animate-fade-in-up">
                        <TripCard trip={trip} />
                    </div>
                ))}
            </div>
         ) : (
             <div className="text-center py-20">
                 <div className="bg-white p-6 rounded-full inline-block shadow-sm mb-4">
                     <MapPin size={48} className="text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900">No destinations found</h3>
                 <p className="text-gray-500">Try adjusting your search or filters.</p>
             </div>
         )}
      </div>

      <Footer />
    </div>
  );
};

export default Destinations;