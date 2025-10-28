import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext'; // Import DataProvider
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/shared/Layout'; // Import the new Layout component

// Lazy load components
const LoginScreen = lazy(() => import('./components/LoginScreen'));
const SignupScreen = lazy(() => import('./components/SignupScreen'));
const OTPVerification = lazy(() => import('./components/OTPVerification'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const ProfileScreen = lazy(() => import('./components/ProfileScreen'));
const VenueDetailsPage = lazy(() => import('./components/VenueDetailsPage'));
const VenueBookingPage = lazy(() => import('./components/VenueBookingPage'));
const CourtListing = lazy(() => import('./components/CourtListing'));
const PaymentScreen = lazy(() => import('./components/PaymentScreen'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const FacilityApprovalPage = lazy(() => import('./components/Admin/FacilityApprovalPage'));
const UserManagementPage = lazy(() => import('./components/Admin/UserManagementPage'));
const AdminProfilePage = lazy(() => import('./components/Admin/AdminProfilePage'));
const UserBookingsPage = lazy(() => import('./components/Admin/UserBookingsPage'));
const OwnerDashboard = lazy(() => import('./components/FacilityOwner/OwnerDashboard'));
const FacilityManagementPage = lazy(() => import('./components/FacilityOwner/FacilityManagementPage'));
const CourtManagementPage = lazy(() => import('./components/FacilityOwner/CourtManagementPage'));
const BookingOverviewPage = lazy(() => import('./components/FacilityOwner/BookingOverviewPage'));

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* <Header /> Moved Header to Layout component */}
        <DataProvider> 
          <Layout> {/* Wrap all routes with Layout */}
            <Suspense fallback={<div>Loading...</div>}> {/* Add Suspense here */}
              <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/signup" element={<SignupScreen />} />
                <Route path="/verify-otp" element={<OTPVerification />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} />} />
                <Route path="/profile" element={<ProtectedRoute element={ProfileScreen} />} />
                <Route path="/venue/:id" element={<ProtectedRoute element={VenueDetailsPage} />} />
                <Route path="/venue-booking/:facilityId/court/:courtId" element={<ProtectedRoute element={VenueBookingPage} />} />
                <Route path="/courts" element={<ProtectedRoute element={CourtListing} />} />
                <Route path="/payment" element={<ProtectedRoute element={PaymentScreen} />} />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute element={AdminDashboard} adminOnly />} />
                <Route path="/admin/facility-approval" element={<ProtectedRoute element={FacilityApprovalPage} adminOnly />} />
                <Route path="/admin/user-management" element={<ProtectedRoute element={UserManagementPage} adminOnly />} />
                <Route path="/admin/profile" element={<ProtectedRoute element={AdminProfilePage} adminOnly />} />
                <Route path="/admin/users/:userId/bookings" element={<ProtectedRoute element={UserBookingsPage} adminOnly />} />

                {/* Facility Owner Routes */}
                <Route path="/owner/dashboard" element={<ProtectedRoute element={OwnerDashboard} ownerOnly />} />
                <Route path="/owner/facilities" element={<ProtectedRoute element={FacilityManagementPage} ownerOnly />} />
                <Route path="/owner/facilities/:facilityId/courts" element={<ProtectedRoute element={CourtManagementPage} ownerOnly />} />
                <Route path="/owner/bookings" element={<ProtectedRoute element={BookingOverviewPage} ownerOnly />} />

                {/* Default/Home Route */}
                <Route path="/" element={<ProtectedRoute element={Dashboard} />} />
              </Routes>
            </Suspense> {/* End Suspense */}
          </Layout>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
