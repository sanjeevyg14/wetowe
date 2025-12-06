import { Trip, BookingStats, BlogPost, Testimonial, Booking, Enquiry } from '../types';

export const trips: Trip[] = [
  {
    id: 'hampi-ruins',
    slug: 'hampi-heritage-weekend',
    title: 'Hampi Heritage & Hippie Island Weekend',
    location: 'Hampi, Karnataka',
    price: 3499,
    duration: '2 Days / 1 Night',
    rating: 9.4,
    reviewsCount: 1240,
    imageUrl: 'https://picsum.photos/id/1040/800/600',
    gallery: [
      'https://picsum.photos/id/1040/800/600',
      'https://picsum.photos/id/106/800/600',
      'https://picsum.photos/id/1039/800/600'
    ],
    description: 'Experience the magic of the Vijayanagara Empire ruins and the chill vibes of Hippie Island. A perfect blend of history and relaxation.',
    highlights: [
      'Coracle Ride in Tungabhadra',
      'Sunset at Matanga Hill',
      'Cliff Jumping (Seasonal)',
      'Musical Pillars of Vitthala Temple'
    ],
    inclusions: ['Accommodation in Homestay', 'Breakfast & Dinner', 'Local Guide', 'Transportation from Bangalore'],
    exclusions: ['Lunch', 'Personal Expenses', 'Entry tickets to monuments'],
    pickupPoints: ['Silk Board (9:00 PM)', 'Marathahalli (9:30 PM)', 'Hebbal (10:15 PM)'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & The Ruins',
        activities: ['Reach Hampi early morning', 'Check-in and freshen up', 'Visit Virupaksha Temple', 'Explore majestic ruins']
      },
      {
        day: 2,
        title: 'Hippie Island & Departure',
        activities: ['Cross the river to Hippie Island', 'Moped ride through paddy fields', 'Lunch at a cafe', 'Depart for Bangalore']
      }
    ],
    dates: ['Dec 8 - Dec 10', 'Dec 15 - Dec 17', 'Dec 22 - Dec 24']
  },
  {
    id: 'kodaikanal-mist',
    slug: 'kodaikanal-princess-of-hill-stations',
    title: 'Kodaikanal: The Princess of Hill Stations',
    location: 'Kodaikanal, Tamil Nadu',
    price: 4199,
    duration: '3 Days / 2 Nights',
    rating: 8.9,
    reviewsCount: 856,
    imageUrl: 'https://picsum.photos/id/1018/800/600',
    gallery: [
      'https://picsum.photos/id/1018/800/600',
      'https://picsum.photos/id/1016/800/600',
      'https://picsum.photos/id/1015/800/600'
    ],
    description: 'Escape the city heat and get lost in the misty mountains of Kodaikanal. Trek through pine forests and row boats in the serene lake.',
    highlights: [
      'Dolphin Nose Trek',
      'Vattakanal Falls',
      'Coaker\'s Walk',
      'Homemade Chocolates'
    ],
    inclusions: ['Hotel Stay', '4 Meals', 'Bonfire Night', 'Forest Permits'],
    exclusions: ['Personal Expenses', 'Lunch on travel days'],
    pickupPoints: ['Electronic City (8:00 PM)', 'Silk Board (8:30 PM)', 'Indiranagar (9:00 PM)'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & Sightseeing',
        activities: ['Arrive and Check-in', 'Visit the Lake', 'Cycling around the lake']
      },
      {
        day: 2,
        title: 'Nature Treks',
        activities: ['Trek to Dolphin Nose', 'Picnic at Pillar Rocks', 'Bonfire & Music night']
      },
      {
        day: 3,
        title: 'Shopping & Return',
        activities: ['Buy spices and chocolates', 'Visit Bryant Park', 'Start return journey']
      }
    ],
    dates: ['Dec 8 - Dec 10', 'Dec 15 - Dec 17']
  },
  {
    id: 'pondicherry-vibes',
    slug: 'pondicherry-french-colonies',
    title: 'Pondicherry: French Colonies & Beaches',
    location: 'Pondicherry',
    price: 3299,
    duration: '2 Days / 1 Night',
    rating: 9.1,
    reviewsCount: 2300,
    imageUrl: 'https://picsum.photos/id/1050/800/600',
    gallery: [
      'https://picsum.photos/id/1050/800/600',
      'https://picsum.photos/id/1051/800/600'
    ],
    description: 'Get a taste of France in India. Colorful streets, serene beaches, and delicious food await you in Pondy.',
    highlights: [
      'Promenade Beach Sunrise',
      'Auroville Visit',
      'French Colony Photo Walk',
      'Paradise Beach Boat Ride'
    ],
    inclusions: ['Stay in Heritage Hotel', 'Scooter Rental Assistance', 'Breakfast'],
    exclusions: ['Fuel', 'Lunch & Dinner', 'Water Sports'],
    pickupPoints: ['Silk Board (10:00 PM)', 'Tin Factory (10:45 PM)'],
    itinerary: [
      {
        day: 1,
        title: 'French Quarter & Beach',
        activities: ['Reach Pondy', 'Explore White Town', 'Rock Beach in the evening']
      },
      {
        day: 2,
        title: 'Auroville & Paradise',
        activities: ['Visit Matrimandir viewing point', 'Boat ride to Paradise Beach', 'Depart for Bangalore']
      }
    ],
    dates: ['Dec 9 - Dec 10', 'Dec 16 - Dec 17']
  },
    {
    id: 'gokarna-beach',
    slug: 'gokarna-beach-trek',
    title: 'Gokarna Beach Trek & Camping',
    location: 'Gokarna, Karnataka',
    price: 3799,
    duration: '2 Days / 1 Night',
    rating: 9.6,
    reviewsCount: 1540,
    imageUrl: 'https://picsum.photos/id/1029/800/600',
    gallery: [
        'https://picsum.photos/id/1029/800/600',
        'https://picsum.photos/id/1031/800/600'
    ],
    description: 'Trek across 5 majestic beaches of Gokarna. Sleep under the stars with beach camping and sound of waves.',
    highlights: [
      '5 Beach Trek',
      'Om Beach Sunset',
      'Beachside Camping',
      'Mahabaleshwar Temple'
    ],
    inclusions: ['Tents (2/3 sharing)', 'Dinner & Breakfast', 'Guide Charges', 'Transport'],
    exclusions: ['Lunch', 'Personal Expenses'],
    pickupPoints: ['Majestic (8:00 PM)', 'Yeshwantpur (8:30 PM)'],
    itinerary: [
      {
        day: 1,
        title: 'The Beach Trek',
        activities: ['Start trek from Paradise Beach', 'Cover Half Moon, Om, Kudle beaches', 'Sunset at Om Beach', 'Campfire']
      },
      {
        day: 2,
        title: 'Temple & Fort',
        activities: ['Visit Mirjan Fort', 'Quick stop at Temple', 'Return journey']
      }
    ],
    dates: ['Dec 8 - Dec 10', 'Dec 22 - Dec 24']
  }
];

export const adminStats: BookingStats[] = [
  { month: 'Jun', bookings: 45, revenue: 157500 },
  { month: 'Jul', bookings: 52, revenue: 182000 },
  { month: 'Aug', bookings: 38, revenue: 133000 },
  { month: 'Sep', bookings: 65, revenue: 227500 },
  { month: 'Oct', bookings: 89, revenue: 311500 },
  { month: 'Nov', bookings: 120, revenue: 420000 },
];

export const blogs: BlogPost[] = [
  {
    id: '1',
    title: 'Backpacking 101: Essential Gear for Weekend Trips',
    category: 'Travel Tips',
    imageUrl: 'https://picsum.photos/id/103/800/600',
    date: 'Nov 12, 2024',
    author: 'Alex Roamer',
    authorAvatar: 'https://i.pravatar.cc/150?img=12',
    readTime: '5 min read',
    status: 'approved',
    metaDescription: 'Discover the ultimate packing checklist for 2-day weekend trips. From backpacks to tech essentials, travel light and smart.',
    tags: ['Travel Tips', 'Packing', 'Backpacking'],
    content: `
      <p class="mb-4">Packing for a weekend trip can be tricky. You don't want to carry too much, but you also don't want to be left without essentials. Here is our guide to the perfect backpack setup for a 2-day adventure.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-3 mt-8">1. The Right Backpack</h3>
      <p class="mb-4">Choose a 30-40L backpack. It's big enough for 2-3 days of clothes but small enough to be carry-on friendly. Look for one with good hip support if you plan on trekking.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-3 mt-8">2. Clothing Strategy</h3>
      <p class="mb-4">Layering is key. Even in summer, nights in places like Hampi or Kodaikanal can get chilly. Always pack:</p>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>A lightweight rain jacket (ponchos work too!)</li>
        <li>Quick-dry t-shirts</li>
        <li>One pair of comfortable trekking pants</li>
        <li>Extra socks - wet feet are the enemy!</li>
      </ul>

      <h3 class="text-2xl font-bold text-gray-900 mb-3 mt-8">3. Tech & Gadgets</h3>
      <p class="mb-4">A power bank is non-negotiable. 10,000mAh should suffice for a weekend. If you're documenting your trip, a lightweight action camera or just a good phone is plenty.</p>

      <p class="mb-4">Remember, the lighter you pack, the further you can go!</p>
    `
  },
  {
    id: '2',
    title: 'Why Hampi Should Be Your Next Solo Adventure',
    category: 'Destinations',
    imageUrl: 'https://picsum.photos/id/1040/800/600',
    date: 'Nov 08, 2024',
    author: 'Sarah Jenkins',
    authorAvatar: 'https://i.pravatar.cc/150?img=9',
    readTime: '4 min read',
    status: 'approved',
    metaDescription: 'Explore why Hampi is the perfect destination for solo travelers. Ruins, safety tips, and the best spots on Hippie Island.',
    tags: ['Hampi', 'Solo Travel', 'India'],
    content: `
      <p class="mb-4">Hampi isn't just a destination; it's a time machine. The ruins of the Vijayanagara Empire are vast, beautiful, and strangely comforting for the solo traveler.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-3 mt-8">Safety First</h3>
      <p class="mb-4">Hampi is incredibly safe for solo travelers, including women. The locals are accustomed to tourists and are generally helpful. However, standard precautions apply—don't venture into isolated ruin areas alone after dark.</p>

      <h3 class="text-2xl font-bold text-gray-900 mb-3 mt-8">Meeting People</h3>
      <p class="mb-4">The easiest way to meet people is to stay on the "Hippie Island" side (Virupapur Gaddi). The cafes here are communal hubs where travelers from all over the world gather to watch movies, jam, and share stories.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-3 mt-8">Must-Do Solo Activities</h3>
      <ul class="list-disc pl-6 mb-4 space-y-2">
        <li>Rent a bicycle and get lost among the boulders.</li>
        <li>Take a coracle ride at sunset.</li>
        <li>Climb Matanga Hill for the best sunrise view in South India.</li>
      </ul>
    `
  },
  {
    id: '3',
    title: 'The Ultimate Guide to Street Food in Gokarna',
    category: 'Food & Culture',
    imageUrl: 'https://picsum.photos/id/431/800/600',
    date: 'Oct 25, 2024',
    author: 'Rohan Mehta',
    authorAvatar: 'https://i.pravatar.cc/150?img=11',
    readTime: '6 min read',
    status: 'approved',
    metaDescription: 'A foodie guide to Gokarna. Best cafes, seafood spots, and local temple town treats you must try.',
    tags: ['Food', 'Gokarna', 'Culture'],
    content: `
      <p class="mb-4">Gokarna is famous for its beaches, but its food scene is an underrated gem. From traditional South Indian thalis to Israeli shakshuka, the town offers a culinary mix that reflects its diverse crowd.</p>
      
      <h3 class="text-2xl font-bold text-gray-900 mb-3 mt-8">Temple Town Treats</h3>
      <p class="mb-4">Around the Mahabaleshwar Temple, look for small stalls selling 'Gadbad' ice cream and fresh banana buns. The local Udupi hotels serve the crispest dosas you'll ever taste.</p>

      <h3 class="text-2xl font-bold text-gray-900 mb-3 mt-8">Beachside Eats</h3>
      <p class="mb-4">On Kudle and Om Beach, the shacks dominate. Try the seafood—freshly caught mackerel fried in Rava is a local staple. For breakfast, many shacks serve Nutella pancakes and fruit bowls.</p>
      
      <div class="bg-gray-100 p-4 rounded-lg border-l-4 border-brand-orange my-6">
        <strong>Pro Tip:</strong> Don't leave without trying the homemade peanut butter sold at the flea markets near the beach!
      </div>
    `
  },
  {
    id: '4',
    title: 'Top 5 Monsoon Treks in Western Ghats',
    category: 'Adventure',
    imageUrl: 'https://picsum.photos/id/10/800/600',
    date: 'Nov 14, 2024',
    author: 'John Doe',
    authorAvatar: 'https://i.pravatar.cc/150?img=68',
    readTime: '3 min read',
    status: 'pending',
    metaDescription: 'Pending blog post about monsoon treks.',
    tags: ['Trekking', 'Monsoon', 'Western Ghats'],
    content: `
      <p>The Western Ghats come alive in the monsoon. Here are our top picks.</p>
      <h3>1. Kudremukh</h3>
      <p>Known for its horse-face shape...</p>
    `
  }
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Anjali P.',
    location: 'Bangalore',
    quote: "I was hesitant about solo traveling, but GetTrippin made it so easy. I met amazing people and the Hampi trip was perfectly organized!",
    rating: 5,
    avatarUrl: 'https://i.pravatar.cc/150?img=5'
  },
  {
    id: '2',
    name: 'Rohan Mehta',
    location: 'Mumbai',
    quote: "The Gokarna beach trek was a blast. The guides were super friendly and the camping experience under the stars was unforgettable.",
    rating: 5,
    avatarUrl: 'https://i.pravatar.cc/150?img=11'
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    location: 'UK',
    quote: "Booked a weekend getaway while visiting India. Safe, fun, and authentic. Highly recommend for any backpacker!",
    rating: 4,
    avatarUrl: 'https://i.pravatar.cc/150?img=9'
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'BK-123456',
    userId: 'mock-user-id',
    tripId: 'hampi-ruins',
    tripTitle: 'Hampi Heritage & Hippie Island Weekend',
    tripImage: 'https://picsum.photos/id/1040/800/600',
    customerName: 'Demo User',
    email: 'user@test.com',
    phone: '9876543210',
    date: 'Dec 8 - Dec 10',
    travelers: 2,
    totalPrice: 6998,
    status: 'confirmed',
    bookedAt: new Date().toISOString()
  },
  {
    id: 'BK-789012',
    userId: 'mock-user-2',
    tripId: 'gokarna-beach',
    tripTitle: 'Gokarna Beach Trek & Camping',
    tripImage: 'https://picsum.photos/id/1029/800/600',
    customerName: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '9876512345',
    date: 'Dec 22 - Dec 24',
    travelers: 1,
    totalPrice: 3799,
    status: 'pending',
    bookedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockEnquiries: Enquiry[] = [
  {
    id: 'EQ-1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '1234567890',
    message: 'Do you have vegan food options included in the Hampi trip?',
    status: 'new',
    createdAt: new Date().toISOString()
  },
  {
    id: 'EQ-2',
    name: 'Bob Jones',
    email: 'bob@example.com',
    phone: '0987654321',
    message: 'Is the Gokarna trek difficult for beginners?',
    status: 'contacted',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];