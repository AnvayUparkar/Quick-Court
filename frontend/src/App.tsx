import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext'; // Import DataProvider
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import OTPVerification from './components/OTPVerification';
import Dashboard from './components/Dashboard'; // Placeholder for dashboard
import ProtectedRoute from './components/ProtectedRoute';
import ProfileScreen from './components/ProfileScreen';
import VenueDetailsPage from './components/VenueDetailsPage';
import VenueBookingPage from './components/VenueBookingPage'; // Added import for VenueBookingPage
import CourtListing from './components/CourtListing'; // Import CourtListing
import PaymentScreen from './components/PaymentScreen'; // Import PaymentScreen
import AdminDashboard from './components/Admin/AdminDashboard';
import FacilityApprovalPage from './components/Admin/FacilityApprovalPage';
import UserManagementPage from './components/Admin/UserManagementPage';
import AdminProfilePage from './components/Admin/AdminProfilePage';
import UserBookingsPage from './components/Admin/UserBookingsPage'; // Import the new UserBookingsPage component
// Facility Owner Imports
import OwnerDashboard from './components/FacilityOwner/OwnerDashboard';
import FacilityManagementPage from './components/FacilityOwner/FacilityManagementPage';
import CourtManagementPage from './components/FacilityOwner/CourtManagementPage';
import BookingOverviewPage from './components/FacilityOwner/BookingOverviewPage';
// import Header from './components/shared/Header'; // Remove direct Header import
import Layout from './components/shared/Layout'; // Import the new Layout component

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* <Header /> Moved Header to Layout component */}
        <DataProvider> 
          <Layout> {/* Wrap all routes with Layout */}
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/signup" element={<SignupScreen />} />
              <Route path="/verify-otp" element={<OTPVerification />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
              <Route path="/profile" element={<ProtectedRoute element={ProfileScreen} />} />
              <Route path="/venue/:id" element={<ProtectedRoute element={VenueDetailsPage} />} />
              <Route path="/venue-booking/:facilityId/court/:courtId" element={<ProtectedRoute element={VenueBookingPage} />} />
              <Route path="/courts" element={<ProtectedRoute element={CourtListing} />} /> {/* Add Courts Listing Route */}
              <Route path="/payment" element={<ProtectedRoute element={PaymentScreen} />} /> {/* Add Payment Route */}

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute element={AdminDashboard} adminOnly />} />
              <Route path="/admin/facility-approval" element={<ProtectedRoute element={FacilityApprovalPage} adminOnly />} />
              <Route path="/admin/user-management" element={<ProtectedRoute element={UserManagementPage} adminOnly />} />
              <Route path="/admin/profile" element={<ProtectedRoute element={AdminProfilePage} adminOnly />} />
              <Route path="/admin/users/:userId/bookings" element={<ProtectedRoute element={UserBookingsPage} adminOnly />} /> {/* New route for user bookings */}

              {/* Facility Owner Routes */}
              <Route path="/owner/dashboard" element={<ProtectedRoute element={OwnerDashboard} ownerOnly />} />
              <Route path="/owner/facilities" element={<ProtectedRoute element={FacilityManagementPage} ownerOnly />} />
              <Route path="/owner/facilities/:facilityId/courts" element={<ProtectedRoute element={CourtManagementPage} ownerOnly />} />
              <Route path="/owner/bookings" element={<ProtectedRoute element={BookingOverviewPage} ownerOnly />} />

              {/* Default/Home Route */}
              <Route path="/" element={<ProtectedRoute element={Dashboard} />} />
            </Routes>
          </Layout>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
