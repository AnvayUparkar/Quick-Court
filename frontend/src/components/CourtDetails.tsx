// Utility to get unique time slots for a court
function getUniqueTimeSlots(slots: Array<{ date: string; time: string; isBooked: boolean }>, selectedDate?: string) {
  let filteredSlots = slots;
  if (selectedDate) {
    const dateObj = new Date(selectedDate);
    filteredSlots = slots.filter(slot => {
      const slotDate = new Date(slot.date);
      return slotDate.toDateString() === dateObj.toDateString();
    });
  }
  const uniqueTimes = Array.from(new Set(filteredSlots.map(s => s.time)));
  return uniqueTimes.map(time => ({
    time,
    isBooked: filteredSlots.filter(s => s.time === time).some(s => s.isBooked),
  })).sort((a, b) => a.time.localeCompare(b.time));
}
"use client"

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Facility, Court } from '../types'; // Corrected import path for Facility and Court
import {
  ArrowLeftIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import { CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Loader from './shared/Loader'; // Import the new Loader component

const CourtDetails = () => {
  const { id } = useParams<{ id: string }>(); // This `id` is actually facilityId
  const navigate = useNavigate();
  const { user } = useAuth();
  const { facilities, fetchFacilities, fetchReviewsForFacility } = useData();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [court, setCourt] = useState<Court | null>(null);
  const [reviews, setReviews] = useState<any[]>([]); // State to store reviews for this facility
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getFacilityAndCourtDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (facilities.length === 0) {
          await fetchFacilities(); // Ensure facilities are fetched
        }
        const foundFacility = facilities.find(f => f._id === id);
        if (foundFacility) {
          setFacility(foundFacility);
          // For CourtDetails, we assume there's only one court, or we need to pass courtId as well.
          // For now, let's display the first court of the facility.
          if (foundFacility.courts && foundFacility.courts.length > 0) {
            setCourt(foundFacility.courts[0]);
          }
          const fetchedReviews = await fetchReviewsForFacility(foundFacility._id);
          setReviews(fetchedReviews);
        } else {
          setError("Facility not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch facility details");
      } finally {
        setLoading(false);
      }
    };
    getFacilityAndCourtDetails();
  }, [id, facilities, fetchFacilities, fetchReviewsForFacility]);

  const handleBookVenue = () => {
    if (!user || !facility || !court) return;
    // Assuming a single court for this simplified CourtDetails page
    navigate(`/venue-booking/${facility._id}/court/${court._id}`);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length) : 0;
  const reviewCount = reviews.length;

  if (loading) return <div className="text-center py-10"><Loader size="w-10 h-10" color="border-blue-600" /></div>;
  if (error) return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  if (!facility || !court) return <div className="text-center py-10">No facility or court found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/courts")}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <span className="text-xl font-bold">QUICKCOURT</span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <UserIcon className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Login
                </Link>
                <span className="text-gray-400">/</span>
                <Link to="/signup" className="text-gray-600 hover:text-gray-900">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Venue Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{court.name}</h1>
                <div className="flex items-center space-x-4 text-gray-600 mb-2">
                  <div className="flex items-center space-x-1">
                    <MapPinIcon className="h-4 w-4 text-red-500" />
                    <span>{facility.location.address}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium">
                      {avgRating > 0 ? `${avgRating.toFixed(1)} (${reviewCount} Reviews)` : `0.0 (${reviewCount} Reviews)`}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookVenue}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
              >
                📅 Book This Venue
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div>
                <div className="relative bg-gray-200 rounded-lg overflow-hidden" style={{ height: "300px" }}>
                  {facility.primaryPhoto || (facility.photos && facility.photos.length > 0) ? (
                    <img
                      src={facility.primaryPhoto ? facility.primaryPhoto : facility.photos[selectedImageIndex] || "/placeholder.svg"}
                      alt={facility.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PhotoIcon className="h-24 w-24 text-gray-400" />
                  )}

                  {facility.photos && facility.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition duration-200"
                      >
                        <ChevronLeftIcon className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(Math.min(facility.photos.length - 1, selectedImageIndex + 1))}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition duration-200"
                      >
                        <ChevronRightIcon className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <p className="text-white text-sm bg-black/50 px-3 py-1 rounded-lg">Images / Videos</p>
                  </div>
                </div>
              </div>

              {/* Sports Available */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sport Type: <span className="font-normal text-gray-500">{court.sportType}</span>
                </h3>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {facility.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>


              {/* Time Slots (deduplicated) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Slots</h3>
                <div className="grid grid-cols-3 gap-3">
                  {court && getUniqueTimeSlots(court.slots).map((slot, idx) => (
                    <span
                      key={idx}
                      className={`px-4 py-2 rounded-md border text-sm font-medium ${slot.isBooked ? 'bg-gray-200 text-gray-500 border-gray-300' : 'bg-white text-gray-800 border-gray-300'}`}
                    >
                      {slot.time}
                    </span>
                  ))}
                </div>
              </div>

              {/* About Venue / Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">About Facility</h3>
                <p className="text-gray-700">{facility.description}</p>
              </div>

              {/* Player Reviews & Ratings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Player Reviews & Ratings</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center mb-2">
                          <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
                          <span>{review.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-gray-800">"{review.comment}"</p>
                        <p className="text-gray-600 text-sm mt-2">By {review.userId.name} on {new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews yet for this facility.</p>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Operating Hours */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <ClockIcon className="h-5 w-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Operating Hours</h4>
                </div>
                <p className="text-gray-700 font-medium">{court.operatingHours.start} - {court.operatingHours.end}</p>
              </div>

              {/* Address */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-2 mb-2">
                  <MapPinIcon className="h-5 w-5 text-red-500 mt-0.5" />
                  <h4 className="font-semibold text-gray-900">Address</h4>
                </div>
                <p className="text-gray-700 text-sm">{facility.location.address}</p>
              </div>

              {/* Location Map */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Location Map</h4>
                <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Map will be displayed here</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourtDetails;
