import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext'; // Import DataProvider
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import OTPVerification from './components/OTPVerification';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileScreen from './components/ProfileScreen';
import Layout from './components/shared/Layout'; // Import the new Layout component
import Loader from './components/shared/Loader';

// Lazy-load heavy route components to reduce initial bundle size
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const VenueDetailsPage = React.lazy(() => import('./components/VenueDetailsPage'));
const VenueBookingPage = React.lazy(() => import('./components/VenueBookingPage'));
const CourtListing = React.lazy(() => import('./components/CourtListing'));
const PaymentScreen = React.lazy(() => import('./components/PaymentScreen'));
const AdminDashboard = React.lazy(() => import('./components/Admin/AdminDashboard'));
const FacilityApprovalPage = React.lazy(() => import('./components/Admin/FacilityApprovalPage'));
const UserManagementPage = React.lazy(() => import('./components/Admin/UserManagementPage'));
const AdminProfilePage = React.lazy(() => import('./components/Admin/AdminProfilePage'));
const UserBookingsPage = React.lazy(() => import('./components/Admin/UserBookingsPage'));
// Facility Owner Imports (lazy)
const OwnerDashboard = React.lazy(() => import('./components/FacilityOwner/OwnerDashboard'));
const FacilityManagementPage = React.lazy(() => import('./components/FacilityOwner/FacilityManagementPage'));
const CourtManagementPage = React.lazy(() => import('./components/FacilityOwner/CourtManagementPage'));
const BookingOverviewPage = React.lazy(() => import('./components/FacilityOwner/BookingOverviewPage'));
// Compliance / Info pages
const Terms = React.lazy(() => import('./components/Terms'));
const Privacy = React.lazy(() => import('./components/Privacy'));
const Refund = React.lazy(() => import('./components/Refund'));

function App() {
    return (
        <Router>
            <AuthProvider>
                {/* <Header /> Moved Header to Layout component */}
                <DataProvider>
                    <Layout> {/* Wrap all routes with Layout */}
                        <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader size="w-12 h-12" color="border-blue-600" /></div>}>
                            <Routes>
                                <Route path="/login" element={<LoginScreen />} />
                                <Route path="/signup" element={<SignupScreen />} />
                                <Route path="/verify-otp" element={<OTPVerification />} />

                                {/* Public Dashboard (visible without login) */}
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/profile" element={<ProtectedRoute element={ProfileScreen} />} />
                                <Route path="/venue/:id" element={<VenueDetailsPage />} />
                                <Route path="/venue-booking/:facilityId/court/:courtId" element={<VenueBookingPage />} />
                                <Route path="/courts" element={<CourtListing />} /> {/* Add Courts Listing Route */}
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

                                {/* Default/Home Route (public) */}
                                <Route path="/" element={<Dashboard />} />
                                {/* Compliance / static pages */}
                                <Route path="/terms" element={<Terms />} />
                                <Route path="/privacy" element={<Privacy />} />
                                <Route path="/refund" element={<Refund />} />
                            </Routes>
                        </Suspense>
                    </Layout>
                </DataProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
