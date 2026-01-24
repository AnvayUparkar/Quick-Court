// Updated DataContext.jsx
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api'; // Make sure this path is correct
import { useAuth } from './AuthContext'; // Import useAuth to check user role
import Loader from '../components/shared/Loader'; // Import Loader component

export const DataContext = createContext(undefined);

export const DataProvider = ({ children }) => {
    const [facilities, setFacilities] = useState([]);
    const [courts, setCourts] = useState([]);
    const [players] = useState([]);
    const [reviews, setReviews] = useState([]);
    // Fetch reviews from backend
    const fetchReviews = useCallback(async () => {
        try {
            const response = await api.get('/api/reviews');
            setReviews(response.data.data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    }, []);
    const [bookings] = useState([]);
    const [ownerBookings, setOwnerBookings] = useState([]);
    const [adminStats, setAdminStats] = useState(null);
    const [ownerStats, setOwnerStats] = useState(null);
    const { user, token } = useAuth();

    const fetchOwnerStats = useCallback(async () => {
        if (!user || !token || user.role !== 'facility_owner') {
            setOwnerStats(null);
            return;
        }
        try {
            const response = await api.get(`/api/facilities/owner/${user._id}/dashboard-stats`);
            setOwnerStats(response.data.data);
        } catch (err) {
            setOwnerStats(null);
            throw err;
        }
    }, [user, token]);
    // Search/filter players by query and filters
    const searchPlayers = useCallback((query, filters) => {
        return players.filter((player) => {
            // Search by name, sport, or bio
            const matchesQuery =
                !query ||
                player.name?.toLowerCase().includes(query.toLowerCase()) ||
                player.sport?.toLowerCase().includes(query.toLowerCase()) ||
                player.bio?.toLowerCase().includes(query.toLowerCase());

            // Filter by sport
            const matchesSport =
                filters.sport === "All Sports" || player.sport === filters.sport;

            // Filter by level
            const matchesLevel =
                filters.level === "All Levels" || player.level === filters.level;

            // Filter by location (match start of location string)
            const matchesLocation =
                filters.location === "All Locations" ||
                (player.location && player.location.split(",")[0] === filters.location);

            return matchesQuery && matchesSport && matchesLevel && matchesLocation;
        });
    }, [players]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // const { user, token } = useAuth(); // Already declared above

    const fetchFacilities = useCallback(async () => {
        try {
            const response = await api.get('/api/facilities');
            setFacilities(response.data.data);
            // Also fetch all courts from these facilities for general use
            const allCourts = [];
            response.data.data.forEach((facility) => {
                if (facility.courts) {
                    facility.courts.forEach((court) => allCourts.push({ ...court, facilityId: facility._id }));
                }
            });
            setCourts(allCourts);
        } catch (err) {
            console.error('Error fetching facilities:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch facilities');
            throw err;
        }
    }, []);

    const fetchCourtsForFacility = useCallback(async (facilityId) => {
        try {
            const response = await api.get(`/api/facilities/${facilityId}/courts`);
            return response.data.data;
        } catch (err) {
            console.error(`Failed to fetch courts for facility ${facilityId}:`, err);
            throw err;
        }
    }, []);

    const fetchAdminStats = useCallback(async () => {
        // Only fetch admin stats if user is admin and token exists
        if (!user || !token || user.role !== 'admin') {
            console.log('User is not admin or not authenticated, skipping admin stats fetch');
            return;
        }

        try {
            console.log('Fetching admin stats for user:', user.role);
            const response = await api.get('/api/admin/dashboard-stats');
            setAdminStats(response.data.data);
        } catch (err) {
            console.error('Error fetching admin stats:', err);

            // Check if it's a 403 error
            if (err.response?.status === 403) {
                console.error('Access denied: User does not have admin privileges');
                setError('Access denied: Admin privileges required');
            } else if (err.response?.status === 401) {
                console.error('Unauthorized: Token may be invalid or expired');
                setError('Authentication required. Please log in again.');
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to fetch admin stats');
            }
            throw err;
        }
    }, [user, token]);

    const fetchOwnerBookings = useCallback(async () => {
        if (!user || !token || user.role !== 'facility_owner') {
            console.log('User is not facility owner or not authenticated, skipping owner bookings fetch');
            setOwnerBookings([]); // Clear bookings if not authorized
            return;
        }

        try {
            const response = await api.get('/api/bookings/owner'); // Corrected endpoint
            setOwnerBookings(response.data.data);
        } catch (err) {
            console.error('Error fetching owner bookings:', err);
            if (err.response?.status === 403) {
                setError('Access denied: Facility owner privileges required');
            } else if (err.response?.status === 401) {
                setError('Authentication required. Please log in again.');
            } else {
                setError(err.response?.data?.message || err.message || 'Failed to fetch owner bookings');
            }
            throw err;
        }
    }, [user, token]);

    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                setError(null);
                await Promise.all([
                    fetchFacilities(),
                    fetchReviews()
                ]);
                if (user?.role === 'admin' && token) {
                    await fetchAdminStats();
                }
                if (user?.role === 'facility_owner' && token) {
                    await fetchOwnerBookings();
                }
            } catch (err) {
                console.error('Failed to initialize data:', err);
                if (user?.role === 'admin' || user?.role === 'facility_owner') {
                    setError('Failed to fetch data');
                }
            } finally {
                setLoading(false);
            }
        };
        if (user || token) {
            initializeData();
        } else if (user === null && token === null) {
            Promise.all([fetchFacilities(), fetchReviews()]).finally(() => setLoading(false));
        }
    }, [user, token, fetchFacilities, fetchAdminStats, fetchOwnerBookings, fetchReviews]);

    const createBooking = useCallback(async (bookingData) => {
        try {
            const response = await api.post('/api/bookings', bookingData);
            return response.data;
        } catch (err) {
            console.error('Error creating booking:', err);
            throw err;
        }
    }, []);

    const createReview = useCallback(async (reviewData) => {
        if (!token) {
            console.error('Error creating review: No authentication token found.');
            throw new Error('Authentication required to create a review.');
        }
        try {
            console.log('Creating review with token:', token);
            await api.post('/api/reviews', reviewData, { headers: { Authorization: `Bearer ${token}` } });
            // Optionally re-fetch all reviews or specifically for the facility
            fetchReviews();
            return Promise.resolve();
        } catch (err) {
            console.error('Error creating review:', err);
            throw err;
        }
    }, [fetchReviews, token]);

    const fetchReviewsForFacility = useCallback(async (facilityId) => {
        try {
            const response = await api.get(`/api/reviews/facility/${facilityId}`);
            return response.data.data;
        } catch (err) {
            console.error(`Error fetching reviews for facility ${facilityId}:`, err);
            throw err;
        }
    }, []);

    const value = {
        facilities,
        courts,
        players,
        reviews,
        bookings,
        ownerBookings,
        createBooking,
        fetchFacilities,
        fetchCourtsForFacility,
        adminStats,
        fetchAdminStats,
        fetchOwnerBookings,
        ownerStats,
        fetchOwnerStats,
        searchPlayers,
        loading,
        error,
        createReview, // Add createReview to value
        fetchReviewsForFacility, // Add fetchReviewsForFacility to value
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Loader size="w-10 h-10" color="border-blue-600" />
            </div>
        );
    }

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
