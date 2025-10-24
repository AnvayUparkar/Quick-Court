import React, { useEffect, useState } from 'react';
// import Header from '../shared/Header'; // Removed local Header import
import { Link } from 'react-router-dom';
import Loader from '../../components/shared/Loader'; // Import the Loader component
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import api from '../../api';

const BookingOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchOwnerBookings, ownerBookings } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'confirmed', 'cancelled', 'completed'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      if (user?.role === 'facility_owner') {
        try {
          await fetchOwnerBookings();
        } catch (err: any) {
          setError(err.message || 'Failed to fetch bookings');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Access Denied: You are not authorized to view this page.');
      }
    };
    loadBookings();
  }, [user, fetchOwnerBookings]);

  const filteredBookings = ownerBookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const userName = booking.userId && booking.userId.name ? booking.userId.name : '';
    const courtName = booking.courtId && booking.courtId.name ? booking.courtId.name : '';
    const facilityName = booking.facilityId && booking.facilityId.name ? booking.facilityId.name : '';
    const matchesSearch = searchTerm === '' ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facilityName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setLoading(true);
      try {
        await api.put(`/bookings/${bookingId}/cancel`);
        await fetchOwnerBookings(); // Refresh bookings
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to cancel booking');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="w-10 h-10" color="border-blue-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (user?.role !== 'facility_owner') {
    return <div className="text-center py-8 text-red-500">Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <Header /> Removed local Header component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Booking Overview</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <input
            type="text"
            placeholder="Search by user, court, or facility name..."
            className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {filteredBookings.length === 0 ? (
          <p className="text-center text-gray-600">No bookings found for your facilities.</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.userId && booking.userId.name ? booking.userId.name : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.facilityId && booking.facilityId.name ? booking.facilityId.name : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.courtId && booking.courtId.name ? booking.courtId.name : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.date ? new Date(booking.date).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.time || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                      {/* Add other actions like mark completed if needed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingOverviewPage;
