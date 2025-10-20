"use client"

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, Facility, Court } from '../contexts/DataContext';
import { MapPinIcon, StarIcon, WifiIcon, ClockIcon } from '@heroicons/react/24/solid';
import { PhotoIcon } from '@heroicons/react/24/outline';

const VenueDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { facilities, fetchCourtsForFacility, fetchFacilities, reviews } = useData();
  // Calculate average rating and review count for this facility
  const facilityReviews = reviews ? reviews.filter((r: any) => r.facilityId === facility?._id) : [];
  const avgRating = facilityReviews.length > 0 ? (facilityReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / facilityReviews.length) : 0;
  const reviewCount = facilityReviews.length;
  const [facility, setFacility] = useState<Facility | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (id) {
      if (facilities.length === 0) {
        // If facilities are not loaded yet in DataContext, trigger a fetch
        // This might be redundant if DataContext already fetches on mount, but ensures data is present.
        // Consider adding a loading state to DataContext if this becomes problematic.
        fetchFacilities();
      }
      const foundFacility = facilities.find(f => f._id === id);
      if (foundFacility) {
        setFacility(foundFacility);
        fetchCourtsForFacility(foundFacility._id).then(setCourts).catch(err => setError(err.message));
        setLoading(false);
      } else if (facilities.length > 0) {
        // If facilities are loaded but the specific facility is not found
        setError("Facility not found");
        setLoading(false);
      }
    }
  }, [id, facilities, fetchCourtsForFacility, fetchFacilities]);

  if (loading) return <div className="text-center py-10">Loading facility details...</div>;
  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  if (!facility) return <div className="text-center py-10">No facility found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <div className="bg-white border-2 border-indigo-500 shadow-lg rounded-lg overflow-hidden transition duration-200 hover:shadow-indigo-400 hover:border-indigo-700">
          {/* Image Gallery */}
          <div className="relative h-96 bg-gray-200 flex items-center justify-center">
            {facility.primaryPhoto ? (
              <img src={facility.primaryPhoto} alt={facility.name} className="w-full h-full object-cover" />
            ) : facility.photos && facility.photos.length > 0 ? (
              <img src={facility.photos[0]} alt={facility.name} className="w-full h-full object-cover" />
            ) : (
              <PhotoIcon className="h-24 w-24 text-gray-400" />
            )}
            {/* Add more images here if facility.photos has more */}
          </div>

          <div className="p-6">
            {/* Venue Details */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{facility.name}</h1>
            <p className="text-gray-600 text-lg flex items-center mb-4">
              <MapPinIcon className="h-5 w-5 mr-2" />
              {facility.location.address}
            </p>

            <div className="flex items-center space-x-4 text-gray-700 mb-6">
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                <span>{avgRating > 0 ? `${avgRating.toFixed(1)} (${reviewCount} Reviews)` : 'No ratings yet'}</span>
              </div>
              <span>•</span>
              <span>{facility.sports.join(', ')}</span>
            </div>

            <p className="text-gray-800 mb-6">{facility.description}</p>

            {/* Amenities */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {facility.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-700">
                  <WifiIcon className="h-5 w-5" /> {/* Placeholder icon, ideally dynamic */}
                  <span>{amenity}</span>
                    </div>
                  ))}
              </div>

            {/* Available Courts */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Courts</h2>
            <div className="space-y-6">
              {courts.length > 0 ? (
                courts.map((court) => (
                  <div key={court._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                      <h3 className="text-xl font-semibold text-gray-900">{court.name} ({court.sportType})</h3>
                      <p className="text-gray-700">Price: ₹{court.pricePerHour}/hour</p>
                      <p className="text-gray-600 flex items-center"><ClockIcon className="h-4 w-4 mr-1"/> {court.operatingHours.start} - {court.operatingHours.end}</p>
                    </div>
                    <Link
                      to={`/venue-booking/${facility._id}/court/${court._id}`}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-200"
                    >
                      Book Now
                    </Link>
                      </div>
                    ))
                  ) : (
                <p className="text-gray-600">No courts available for this facility.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetailsPage;
