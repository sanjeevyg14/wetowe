
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Trip = require('./models/Trip.cjs');
const Testimonial = require('./models/Testimonial.cjs');
const Booking = require('./models/Booking.cjs');
const Enquiry = require('./models/Enquiry.cjs');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const trips = [
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

const testimonials = [
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

const mockBookings = [
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

const mockEnquiries = [
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

const seedDB = async () => {
    if (!MONGO_URI) {
        console.error("MONGO_URI is not defined in the environment variables.");
        process.exit(1);
    }
    await mongoose.connect(MONGO_URI);

    await Trip.deleteMany({});
    await Trip.insertMany(trips);

    await Testimonial.deleteMany({});
    await Testimonial.insertMany(testimonials);

    await Booking.deleteMany({});
    await Booking.insertMany(mockBookings);

    await Enquiry.deleteMany({});
    await Enquiry.insertMany(mockEnquiries);

    console.log('Database seeded!');
    mongoose.connection.close();
};

seedDB();
