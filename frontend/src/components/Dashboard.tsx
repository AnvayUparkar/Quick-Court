import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext'; // Import useData

function ImageScroller({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, images.length]);

  return (
    <div style={{ width: '300px', height: '180px', overflow: 'hidden', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          width: `${images.length * 320}px`,
          transform: `translateX(-${index * 320}px)`,
          transition: 'transform 1s cubic-bezier(0.77,0,0.18,1)',
        }}
      >
        {images.map((img: string, i: number) => (
          <img
            key={i}
            src={img}
            alt="Facility"
            style={{ width: '300px', height: '180px', objectFit: 'cover', borderRadius: '1rem', marginRight: '20px' }}
          />
        ))}
      </div>
    </div>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const { facilities, fetchFacilities } = useData(); // Get facilities and fetchFacilities from DataContext

  useEffect(() => {
    fetchFacilities(); // Fetch facilities when the component mounts
  }, [fetchFacilities]);

  console.log('Facilities in Dashboard:', facilities);

  const sportsCategories = [
    { name: 'Badminton', image: 'https://images.pexels.com/photos/976873/pexels-photo-976873.jpeg', color: 'bg-blue-500' },
    { name: 'Football', image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg', color: 'bg-green-500' },
    { name: 'Cricket', image: 'https://images.pexels.com/photos/1661950/pexels-photo-1661950.jpeg', color: 'bg-red-500' },
    { name: 'Swimming', image: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg', color: 'bg-cyan-500' },
    { name: 'Tennis', image: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg', color: 'bg-yellow-500' },
    { name: 'Table Tennis', image: 'https://images.pexels.com/photos/976873/pexels-photo-976873.jpeg', color: 'bg-purple-500' }
  ];

  // Filter and limit facilities to use as recommended courts
  const recommendedCourts = facilities.filter(f => f.approved).slice(0, 4); // Only show approved facilities
  console.log('Recommended Courts in Dashboard:', recommendedCourts);

  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
          <p>Welcome, Admin! Here you can manage users, facilities, and view global statistics.</p>
          {/* Admin specific content will go here */}
        </div>
      </div>
    );
  }

  if (user?.role === 'facility_owner') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Facility Owner Dashboard</h1>
          <p>Welcome, Facility Owner! Here you can manage your facilities, courts, and bookings.</p>
          {/* Facility Owner specific content will go here */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile View */}
      <div className="md:hidden">
        <div
          className="bg-white p-4 rounded-xl shadow-md"
          style={{
            border: "2px solid",
            borderImage: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%) 1",
            borderRadius: "1rem",
          }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <MapPinIcon className="h-5 w-5 text-indigo-600" />
            <span className="text-gray-700">Ahmedabad</span>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">FIND PLAYERS & VENUES NEARBY</h2>
            <p className="text-gray-600 text-sm">Seamlessly explore sports venues and play with sports enthusiasts just like you!</p>
          </div>
          <Link
            to="/courts"
            className="block text-white text-center py-3 rounded-lg font-semibold transition duration-200 mb-6"
            style={{
              background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
            }}
          >
            Book Venues
          </Link>
          <div className="space-y-4">
            {recommendedCourts.slice(0, 2).map((facility) => (
              <div key={facility._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={facility.primaryPhoto || (facility.photos[0] || 'https://via.placeholder.com/300')}
                  alt={facility.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{facility.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{facility.location.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium">4.5</span>
                    </div>
                    <span className="font-semibold text-indigo-600">View Courts</span>
                  </div>
                  <Link to={`/venue/${facility._id}`} className="absolute inset-0"></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div
            className="p-8 text-white mb-12 shadow-md flex flex-row items-stretch"
            style={{
              borderRadius: "2rem",
              background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
            }}
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <MapPinIcon className="h-6 w-6" />
                <span className="text-lg">Ahmedabad</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">FIND PLAYERS & VENUES NEARBY</h1>
              <p className="text-xl mb-6 opacity-90">
                Seamlessly explore sports venues and play with sports enthusiasts just like you!
              </p>
              <Link
                to="/courts"
                className="inline-block text-white px-8 py-3 rounded-lg font-semibold transition duration-200"
                style={{
                  background: "#10b981",
                }}
              >
                Book Venues
              </Link>
            </div>
            {/* Desktop-only image scroller section */}
            <div className="hidden lg:flex items-center ml-8" style={{ width: '320px', minWidth: '320px', maxWidth: '320px', overflow: 'hidden', position: 'relative' }}>
              <ImageScroller images={facilities.filter(f => f.photos && f.photos.length > 0).map(f => f.photos[0])} />
            </div>
          </div>

          {/* Recommended Courts (now Facilities) */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Book Venues</h2>
              <Link
                to="/courts"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                See all venues →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedCourts.map((facility) => (
                <Link
                  key={facility._id}
                  to={`/venue/${facility._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200 hover:border-2 hover:border-indigo-600"
                >
                  <img
                    src={facility.primaryPhoto || (facility.photos[0] || 'https://via.placeholder.com/400')}
                    alt={facility.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{facility.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{facility.location.address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium">4.5</span> {/* Placeholder rating */}
                      </div>
                      <span className="font-semibold text-indigo-600">View Courts</span> {/* Changed from price */}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Popular Sports */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Sports</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {sportsCategories.map((sport) => (
                <Link
                  key={sport.name}
                  to={`/courts?sport=${sport.name.toLowerCase()}`}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg aspect-square">
                    <img
                      src={sport.image}
                      alt={sport.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">{sport.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;