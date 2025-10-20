import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import { Booking } from '../../types'; // Assuming you have a Booking type defined and updated

const UserBookingsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      if (!userId) {
        setError('User ID is missing.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Assuming a backend endpoint like /api/admin/users/:userId/bookings
        const response = await api.get(`/admin/users/${userId}/bookings`);
        setBookings(response.data.data || []);
      } catch (err: any) {
        console.error('Error fetching user bookings:', err);
        setError(err.response?.data?.message || 'Failed to fetch bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">Loading user bookings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Bookings for User: {userId}</h1>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings found for this user.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Booking ID: {booking._id}</h2>
              <p className="text-gray-600"><strong>Facility:</strong> {booking.facilityId?.name || 'N/A'}</p>
              <p className="text-gray-600"><strong>Court:</strong> {booking.courtId?.name || 'N/A'}</p>
              <p className="text-gray-600"><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p className="text-gray-600"><strong>Time:</strong> {booking.time}</p>
              <p className="text-gray-600"><strong>Status:</strong> {booking.status}</p>
              {/* Add more booking details as needed */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookingsPage;
