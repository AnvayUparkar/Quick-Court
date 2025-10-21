"use client"

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { useData } from '../contexts/DataContext';

const CourtListing = () => {
  const { facilities, fetchFacilities, reviews } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sport: 'All Sports',
    venueType: 'All',
    priceRange: 'Any Price',
    rating: 'Any Rating',
    location: 'All Locations',
  });
  const [sortBy, setSortBy] = useState('Relevance');

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  const uniqueLocations = Array.from(new Set(facilities.map(f => f.location.address.split(',')[0]))).filter(Boolean);

  // Filter facilities based on search query and filters
  let filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.sports.some(sport => sport.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSport = filters.sport === 'All Sports' || facility.sports.map(s => s.toLowerCase()).includes(filters.sport.toLowerCase());
    const matchesVenueType = filters.venueType === 'All' || (filters.venueType === 'Indoor' ? facility.amenities.includes('Indoor') : facility.amenities.includes('Outdoor'));
  // Calculate min pricePerHour from courts
  const minPrice = facility.courts && facility.courts.length > 0 ? Math.min(...facility.courts.map((court: any) => court.pricePerHour)) : 0;
  const matchesPrice = filters.priceRange === 'Any Price' || (parseInt(filters.priceRange) <= minPrice);
  // Calculate rating and ratingCount from global reviews
  const facilityReviews = reviews ? reviews.filter((r: any) => r.facilityId === facility._id) : [];
  const rating = facilityReviews.length > 0 ? (facilityReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / facilityReviews.length) : 0;
  //const Review = facilityReviews.length; // Removed unused variable
  const matchesRating = filters.rating === 'Any Rating' || (rating >= parseFloat(filters.rating));
  const matchesLocation = filters.location === 'All Locations' || (facility.location.address.toLowerCase().includes(filters.location.toLowerCase()));
  return facility.approved && matchesSearch && matchesSport && matchesVenueType && matchesPrice && matchesRating && matchesLocation;
  });

  // Sort logic
  if (sortBy === 'Price Low to High') {
    filteredFacilities = filteredFacilities.sort((a, b) => {
      const aMin = a.courts && a.courts.length > 0 ? Math.min(...a.courts.map((court: any) => court.pricePerHour)) : 0;
      const bMin = b.courts && b.courts.length > 0 ? Math.min(...b.courts.map((court: any) => court.pricePerHour)) : 0;
      return aMin - bMin;
    });
  } else if (sortBy === 'Price High to Low') {
    filteredFacilities = filteredFacilities.sort((a, b) => {
      const aMin = a.courts && a.courts.length > 0 ? Math.min(...a.courts.map((court: any) => court.pricePerHour)) : 0;
      const bMin = b.courts && b.courts.length > 0 ? Math.min(...b.courts.map((court: any) => court.pricePerHour)) : 0;
      return bMin - aMin;
    });
  } else if (sortBy === 'Rating') {
    filteredFacilities = filteredFacilities.sort((a, b) => {
      const aReviews = reviews ? reviews.filter((r: any) => r.facilityId === a._id) : [];
      const bReviews = reviews ? reviews.filter((r: any) => r.facilityId === b._id) : [];
      const aRating = aReviews.length > 0 ? (aReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / aReviews.length) : 4.5;
      const bRating = bReviews.length > 0 ? (bReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / bReviews.length) : 4.5;
      return bRating - aRating;
    });
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sports Venues in Ahmedabad</h1>
        <p className="text-gray-600 mb-6">Discover and Book Nearby Venues</p>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="md:w-1/4 bg-white rounded-lg shadow-md p-6 mb-8 relative overflow-hidden group">
            <div className="absolute inset-0 rounded-lg pointer-events-none"
                 style={{
                   background: "linear-gradient(to right, #3b82f6, #10b981)",
                   mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                   maskComposite: "exclude",
                   padding: "2px", // Border thickness
                   WebkitMaskComposite: "exclude", // For Safari
                 }}
            ></div>
            <h2 className="text-lg font-bold mb-4">Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sport Type</label>
                <select name="sport" value={filters.sport} onChange={handleFilterChange} className="block w-full border-gray-300 rounded-md">
                  <option value="All Sports">All Sports</option>
                  <option value="badminton">Badminton</option>
                  <option value="football">Football</option>
                  <option value="cricket">Cricket</option>
                  <option value="swimming">Swimming</option>
                  <option value="tennis">Tennis</option>
                  <option value="table tennis">Table Tennis</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Type</label>
                <select name="venueType" value={filters.venueType} onChange={handleFilterChange} className="block w-full border-gray-300 rounded-md">
                  <option value="All">All</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (per hour)</label>
                <select name="priceRange" value={filters.priceRange} onChange={handleFilterChange} className="block w-full border-gray-300 rounded-md">
                  <option value="Any Price">Any Price</option>
                  <option value="200">₹200+</option>
                  <option value="400">₹400+</option>
                  <option value="800">₹800+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select name="location" value={filters.location} onChange={handleFilterChange} className="block w-full border-gray-300 rounded-md">
                  <option value="All Locations">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
                <select name="rating" value={filters.rating} onChange={handleFilterChange} className="block w-full border-gray-300 rounded-md">
                  <option value="Any Rating">Any Rating</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="4.5">4.5+</option>
                </select>
              </div>
              <button onClick={() => setFilters({ sport: 'All Sports', venueType: 'All', priceRange: 'Any Price', rating: 'Any Rating', location: 'All Locations' })} className="w-full bg-red-600 text-white py-2 rounded mt-2">Clear Filters</button>
            </div>
          </aside>
          {/* Main Venue Grid */}
          <main className="flex-1">
            {/* Top Search and Sort Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <form className="flex-1 flex gap-2" onSubmit={e => { e.preventDefault(); }}>
                <input
                  type="text"
                  placeholder="Search by venue name, sport, or location..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
                <button type="submit" className="bg-gradient-to-r from-blue-500 via-green-500 to-green-600 text-white px-6 py-2 rounded-md font-semibold shadow-md hover:from-blue-600 hover:to-green-700 transition">Search</button>
              </form>
              <div>
                <label className="mr-2 text-sm font-medium text-gray-700">Sort by:</label>
                <select value={sortBy} onChange={handleSortChange} className="border-gray-300 rounded-md">
                  <option value="Relevance">Relevance</option>
                  <option value="Price Low to High">Price Low to High</option>
                  <option value="Price High to Low">Price High to Low</option>
                  <option value="Rating">Rating</option>
                </select>
              </div>
            </div>
            <div className="mb-2 text-gray-600 text-sm">Showing {filteredFacilities.length === 0 ? 0 : `1-${filteredFacilities.length}`} of {filteredFacilities.length} venues</div>
            {/* Venue Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.length > 0 ? (
                filteredFacilities.map((facility) => {
                  const minPrice = facility.courts && facility.courts.length > 0 ? Math.min(...facility.courts.map((court: any) => court.pricePerHour)) : 0;
                  const facilityReviews = reviews ? reviews.filter((r: any) => r.facilityId === facility._id) : [];
                  const rating = facilityReviews.length > 0 ? (facilityReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / facilityReviews.length) : 0;
                  const ratingCount = facilityReviews.length;
                  // Example tags: Top Rated, Budget, etc. (mock for now)
                  const tags = [];
                  if (rating >= 4.5) tags.push('Top Rated');
                  if (minPrice <= 200) tags.push('Budget');
                  return (
                    <div key={facility._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition duration-200 hover:border-2 hover:border-indigo-500 hover:shadow-indigo-400">
                      <img
                        src={facility.primaryPhoto || (facility.photos[0] || 'https://via.placeholder.com/400')}
                        alt={facility.name}
                        className="w-full h-32 md:h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{facility.name}</h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{facility.location.address}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{rating > 0 ? `${rating.toFixed(1)} (${ratingCount} Reviews)` : `0.0 (${ratingCount} Reviews)`}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {facility.sports.map((sport, idx) => (
                            <span key={sport + idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">{sport.charAt(0).toUpperCase() + sport.slice(1)}</span>
                          ))}
                          {facility.amenities && facility.amenities.includes('Indoor') && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Indoor</span>}
                          {facility.amenities && facility.amenities.includes('Outdoor') && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium">Outdoor</span>}
                          {tags.map((tag, idx) => (
                            <span key={tag + idx} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium">{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg text-gray-900">₹{minPrice}/hour</span>
                          <Link to={`/venue/${facility._id}`} className="bg-gradient-to-r from-blue-500 via-green-500 to-green-600 text-white px-4 py-2 rounded font-semibold shadow-md hover:from-blue-600 hover:to-green-700 transition">View Courts</Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-600 col-span-full text-center">No venues found matching your criteria.</p>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CourtListing;
