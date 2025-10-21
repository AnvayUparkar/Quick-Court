"use client"

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData, Facility, Court, Review } from '../contexts/DataContext';
import { MapPinIcon, StarIcon, WifiIcon, ClockIcon } from '@heroicons/react/24/solid';
import { PhotoIcon } from '@heroicons/react/24/outline';
import ReviewForm from './ReviewForm'; // Import the new ReviewForm component

const VenueDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const { facilities, fetchCourtsForFacility, fetchFacilities, reviews: globalReviews, fetchReviewsForFacility } = useData();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]); // State to store reviews for this facility
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false); // State to control review form visibility

  // Calculate average rating and review count for this facility
  const facilityReviews = facility && globalReviews ? globalReviews.filter((r: any) => r.facilityId === facility._id) : [];
  const avgRating = facilityReviews.length > 0 ? (facilityReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / facilityReviews.length) : 0;
  const reviewCount = facilityReviews.length;

  const loadFacilityData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const currentFacilities = facilities.length === 0 ? (await fetchFacilities(), facilities) : facilities; // Ensure facilities are up-to-date
      const foundFacility = currentFacilities.find(f => f._id === id);
      if (foundFacility) {
        setFacility(foundFacility);
        // Fetch courts and reviews concurrently
        const [fetchedCourts, fetchedReviews] = await Promise.all([
          fetchCourtsForFacility(foundFacility._id),
          fetchReviewsForFacility(foundFacility._id)
        ]);
        setCourts(fetchedCourts);
        setReviews(fetchedReviews);
      } else {
        setError("Facility not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load facility data");
    } finally {
      setLoading(false);
    }
  }, [id, fetchFacilities, fetchCourtsForFacility, fetchReviewsForFacility]); // Removed 'facilities' from dependencies

  useEffect(() => {
    loadFacilityData();
  }, [loadFacilityData]);

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    loadFacilityData(); // Reload data to show new review
  };

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
                <span>{avgRating > 0 ? `${avgRating.toFixed(1)} (${reviewCount} Reviews)` : `0.0 (${reviewCount} Reviews)`}</span>
              </div>
              <span>•</span>
              <span>{facility.sports.join(', ')}</span>
            </div>

            <p className="text-gray-800 mb-6">{facility.description}</p>

            {/* Rate and Review Button */}
            {!showReviewForm && (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="block w-full text-white text-center py-3 rounded-lg font-semibold transition duration-200 mb-8"
                style={{
                  background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
                }}
              >
                Rate and Review
              </button>
            )}

            {showReviewForm && facility && (
              <ReviewForm 
                facilityId={facility._id}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            )}

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

            {/* Reviews */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Reviews</h2>
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="bg-gray-100 p-6 rounded-lg">
                    <div className="flex items-center mb-2">
                      <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                      <span>{review.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-gray-800">"{review.comment}"</p>
                    <p className="text-gray-600 text-sm mt-2">By {review.userId.name} on {new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No reviews yet for this facility.</p>
              )}
            </div>
            
            {/* Available Courts */}
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Available Courts</h2>
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
