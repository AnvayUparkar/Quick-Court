import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom'; // Added Link import
// import Header from '../shared/Header'; // Removed unused Header import

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { fetchFacilities, facilities, fetchOwnerBookings, fetchAdminStats, adminStats, ownerStats, fetchOwnerStats } = useData();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (user?.role === 'facility_owner') {
        try {
          await fetchFacilities();
          await fetchOwnerBookings();
          await fetchAdminStats();
          await fetchOwnerStats();
        } catch (err: any) {
          setError(err.message || 'Failed to fetch facilities');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Access Denied: You are not authorized to view this page.');
      }
    };
    loadData();
  }, [user, fetchFacilities, fetchOwnerBookings, fetchAdminStats, fetchOwnerStats]);

  const ownerFacilities = facilities.filter(f => f.ownerId._id === user?._id);

  // KPIs: Prefer backend stats if available, else fallback to local calculation
  const totalBookings = ownerStats?.totalBookings ?? adminStats?.totalBookings ?? ownerFacilities.reduce((sum, facility) => sum + (facility.courts?.reduce((courtSum, court) => courtSum + court.slots.filter(s => s.isBooked).length, 0) || 0), 0);
  const activeCourts = ownerStats?.activeCourts ?? adminStats?.totalActiveCourts ?? ownerFacilities.reduce((sum, facility) => sum + (facility.courts?.filter(c => c.slots.some(s => s.isBooked)).length || 0), 0);
  const totalEarnings = ownerStats?.totalEarnings ?? ownerFacilities.reduce((sum, facility) => sum + (facility.courts?.reduce((courtSum, court) => courtSum + court.slots.filter(s => s.isBooked).length * court.pricePerHour, 0) || 0), 0);


  // --- Chart Data (Placeholder/Example) ---
  const bookingTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Bookings',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const earningsSummaryData = {
    labels: ['Badminton', 'Tennis', 'Football'],
    datasets: [
      {
        label: 'Earnings',
        data: [300, 500, 200],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const peakBookingHoursData = {
    labels: ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm'],
    datasets: [
      {
        label: 'Bookings per Hour',
        data: [2, 3, 5, 8, 10, 7, 6, 9, 11, 12, 8, 4, 3, 2, 1],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };
  // --- End Chart Data ---

  if (loading) {
    return <div className="text-center py-8">Loading Owner Dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  if (user?.role !== 'facility_owner') {
    return <div className="text-center py-8 text-red-500">Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <Header /> Removed local Header component as it's now handled globally by Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Owner Dashboard</h1>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 justify-center">
          <Link to="/owner/facilities" className="group bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center transform transition-all duration-300 ease-in-out hover:scale-105 hover:border-b-4 hover:border-cyan-500">
            <svg className="h-16 w-16 text-indigo-600 mb-4 group-hover:text-cyan-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-2 4h4m-2-4h.01M9 10h.01M9 13h.01M9 16h.01M15 10h.01M15 13h.01M15 16h.01" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 group-hover:text-cyan-700 transition-colors duration-300 mb-2">Facility Management</h2>
            <p className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Manage your sports facilities, update details, and add new venues.</p>
          </Link>

          <Link to="/owner/bookings" className="group bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center transform transition-all duration-300 ease-in-out hover:scale-105 hover:border-b-4 hover:border-cyan-500">
            <svg className="h-16 w-16 text-indigo-600 mb-4 group-hover:text-cyan-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h.01M17 11h.01M9 15h.01M15 15h.01M9 19h.01M15 19h.01M7 11v-4a2 2 0 012-2h6a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-xl font-semibold text-gray-700 group-hover:text-cyan-700 transition-colors duration-300 mb-2">Booking Overview</h2>
            <p className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">View and manage all bookings for your facilities.</p>
          </Link>
        </div>
        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Bookings</h2>
            <p className="text-4xl font-bold text-indigo-600">{totalBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Active Courts</h2>
            <p className="text-4xl font-bold text-green-600">{activeCourts}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Earnings</h2>
            <p className="text-4xl font-bold text-yellow-600">₹{totalEarnings}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Booking Trends</h2>
            <Line data={bookingTrendsData} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Earnings by Sport</h2>
            <Doughnut data={earningsSummaryData} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Peak Booking Hours</h2>
          <Bar data={peakBookingHoursData} />
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

