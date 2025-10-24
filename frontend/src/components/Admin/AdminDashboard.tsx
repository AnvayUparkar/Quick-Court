import React, { useEffect, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
} from 'chart.js';
import Loader from '../../components/shared/Loader'; // Import the Loader component

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
);

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { fetchAdminStats, adminStats } = useData(); // Destructure fetchAdminStats and adminStats from useData
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminStats()
        .then(() => setLoading(false))
        .catch((err: any) => {
          setError(err.message || 'Failed to fetch admin stats');
          setLoading(false);
        });
    }
  }, [user, fetchAdminStats]);

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

  if (user?.role !== 'admin') {
    return <div className="text-center py-8 text-red-500">Access Denied: You are not authorized to view this page.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link to="/admin/profile" className="group bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center transform transition-all duration-300 ease-in-out hover:scale-105 hover:border-b-4 hover:border-indigo-500">
          <svg className="h-16 w-16 text-blue-600 mb-4 group-hover:text-indigo-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 group-hover:text-indigo-700 transition-colors duration-300 mb-2">Admin Profile</h2>
          <p className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Manage your administrator profile settings.</p>
        </Link>

        <Link to="/admin/facility-approval" className="group bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center transform transition-all duration-300 ease-in-out hover:scale-105 hover:border-b-4 hover:border-green-500">
          <svg className="h-16 w-16 text-green-600 mb-4 group-hover:text-green-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 group-hover:text-green-700 transition-colors duration-300 mb-2">Facility Approval</h2>
          <p className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Review and approve new facility registrations.</p>
        </Link>

        <Link to="/admin/user-management" className="group bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center text-center transform transition-all duration-300 ease-in-out hover:scale-105 hover:border-b-4 hover:border-red-500">
          <svg className="h-16 w-16 text-red-600 mb-4 group-hover:text-red-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0h4m-4 0a5 5 0 01-5-5v-1a7 7 0 00-7-7H5a7 7 0 00-7 7v1a5 5 0 015 5m10 0v-2a3 3 0 00-3-3H9m11-9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2m14 0l-3 3m0 0l-3-3" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 group-hover:text-red-700 transition-colors duration-300 mb-2">User Management</h2>
          <p className="text-gray-500 group-hover:text-gray-600 transition-colors duration-300">Manage user accounts, roles, and permissions.</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Users</h2>
          <p className="text-4xl font-bold text-indigo-600">{adminStats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Facility Owners</h2>
          <p className="text-4xl font-bold text-green-600">{adminStats?.totalFacilityOwners || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Bookings</h2>
          <p className="text-4xl font-bold text-yellow-600">{adminStats?.totalBookings || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Active Courts</h2>
          <p className="text-4xl font-bold text-red-600">{adminStats?.totalActiveCourts || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Booking Activity Over Time</h2>
          <div className="h-64">
            <Line data={bookingActivityData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">User Registration Trends</h2>
          <div className="h-64">
            <Bar data={userRegistrationData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Facility Approval Trend</h2>
          <div className="h-64">
            <Line data={facilityApprovalData} options={chartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Most Active Sports</h2>
          <div className="h-64">
            <Pie data={mostActiveSportsData} options={pieChartOptions} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Earnings Simulation Chart</h2>
          <div className="h-64">
            <Line data={earningsSimulationData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Dummy Data for Charts
const bookingActivityData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Bookings',
      data: [65, 59, 80, 81, 56, 70],
      fill: false,
      backgroundColor: 'rgb(75, 192, 192)',
      borderColor: 'rgba(75, 192, 192, 0.2)',
    },
  ],
};

const userRegistrationData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'New Users',
      data: [30, 45, 25, 50, 40, 60],
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    },
  ],
};

const facilityApprovalData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Approved Facilities',
      data: [5, 9, 12, 10, 8, 15],
      fill: false,
      backgroundColor: 'rgb(255, 159, 64)',
      borderColor: 'rgba(255, 159, 64, 0.2)',
    },
  ],
};

const mostActiveSportsData = {
  labels: ['Badminton', 'Tennis', 'Squash', 'Basketball'],
  datasets: [
    {
      label: '# of Bookings',
      data: [12, 19, 3, 5],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

const earningsSimulationData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
  datasets: [
    {
      label: 'Projected Earnings',
      data: [1200, 1900, 1300, 2000, 1800, 2500],
      fill: true,
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
      text: 'Chart.js Chart',
    },
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
      text: 'Chart.js Pie Chart',
    },
  },
};

export default AdminDashboard;
