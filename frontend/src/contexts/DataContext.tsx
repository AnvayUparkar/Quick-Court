// Updated DataContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api'; // Make sure this path is correct
import {
  Facility,
  Booking,
  AdminStats,
  OwnerStats,
  Court
} from '../types';

export type { Facility, Court };
import { useAuth } from './AuthContext'; // Import useAuth to check user role

export interface BookingPayload {
  facilityId: string;
  courtId: string;
  date: string;
  timeSlot: string;
}

export interface DataContextType {
  facilities: Facility[];
  courts: Court[];
  players: any[];
  reviews: any[];
  bookings: Booking[];
  ownerBookings: Booking[];
  createBooking: (bookingData: BookingPayload) => Promise<void>;
  fetchFacilities: () => Promise<void>;
  fetchCourtsForFacility: (facilityId: string) => Promise<Court[]>;
  adminStats: AdminStats | null;
  fetchAdminStats: () => Promise<void>;
  fetchOwnerBookings: () => Promise<void>;
  ownerStats: OwnerStats | null;
  fetchOwnerStats: () => Promise<void>;
  searchPlayers: (query: string, filters: { sport: string; level: string; location: string }) => any[];
  loading: boolean;
  error: string | null;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [players] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  // Fetch reviews from backend
  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get('/reviews');
      setReviews(response.data.data);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    }
  }, []);
  const [bookings] = useState<Booking[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [ownerStats, setOwnerStats] = useState<OwnerStats | null>(null);
  const { user, token } = useAuth();

  const fetchOwnerStats = useCallback(async () => {
    if (!user || !token || user.role !== 'facility_owner') {
      setOwnerStats(null);
      return;
    }
    try {
      const response = await api.get(`/facilities/owner/${user._id}/dashboard-stats`);
      setOwnerStats(response.data.data);
    } catch (err: any) {
      setOwnerStats(null);
      throw err;
    }
  }, [user, token]);
  // Search/filter players by query and filters
  const searchPlayers = useCallback((query: string, filters: { sport: string; level: string; location: string }) => {
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
  const [error, setError] = useState<string | null>(null);
  
  // const { user, token } = useAuth(); // Already declared above

  const fetchFacilities = useCallback(async () => {
    try {
      const response = await api.get('/facilities');
      setFacilities(response.data.data);
      // Also fetch all courts from these facilities for general use
      const allCourts: Court[] = [];
      response.data.data.forEach((facility: Facility) => {
        if (facility.courts) {
          facility.courts.forEach((court: Court) => allCourts.push({ ...court, facilityId: facility._id }));
        }
      });
      setCourts(allCourts);
    } catch (err: any) {
      console.error('Error fetching facilities:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch facilities');
      throw err;
    }
  }, []);

  const fetchCourtsForFacility = useCallback(async (facilityId: string) => {
    try {
      const response = await api.get(`/facilities/${facilityId}/courts`);
      return response.data.data;
    } catch (err: any) {
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
      const response = await api.get('/admin/dashboard-stats');
      setAdminStats(response.data.data);
    } catch (err: any) {
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
      const response = await api.get('/bookings/owner'); // Corrected endpoint
      setOwnerBookings(response.data.data);
    } catch (err: any) {
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

  const createBooking = useCallback(async (bookingData: BookingPayload) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (err: any) {
      console.error('Error creating booking:', err);
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
  };

  if (loading) {
    return <div>Loading...</div>;
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