"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string; // Changed from id to _id
    name: string;
    email: string;
    role: string;
    avatar?: string;
    verified: boolean;
    bookings?: string[]; // Array of Booking IDs (optional as it might not be populated everywhere)
    isBanned?: boolean; // Add isBanned property
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (userData: FormData) => Promise<any>;
    verifyOtp: (userId: string, otp: string) => Promise<any>;
    logout: () => void;
    updateUser: (userData: User) => void; // Added updateUser function
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null); // Explicitly type user state
    const [token, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:8000/api/auth'; 

  useEffect(() => {
        const loadUser = async () => {
            const storedToken = localStorage.getItem('token');
            const storedRefreshToken = localStorage.getItem('refreshToken');
            const storedUser = localStorage.getItem('user');
            
            console.log('AuthContext: Loading user from localStorage');
            console.log('AuthContext: storedToken:', storedToken ? 'exists' : 'missing');
            console.log('AuthContext: storedRefreshToken:', storedRefreshToken ? 'exists' : 'missing');
            console.log('AuthContext: storedUser:', storedUser ? 'exists' : 'missing');

            if (storedToken && storedRefreshToken && storedUser) {
                setToken(storedToken);
                setRefreshToken(storedRefreshToken);
                const parsedUser = JSON.parse(storedUser);
                setUser({ ...parsedUser, _id: parsedUser._id || parsedUser.id }); // Ensure _id is always set
                console.log('AuthContext: User loaded from localStorage:', parsedUser);
            } else {
                console.log('AuthContext: Missing required authentication data');
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string) => { // Explicitly type parameters
        console.log('AuthContext: Login attempt for email:', email);
        const response = await axios.post(`${API_URL}/login`, { email, password });
        const { token, refreshToken, user } = response.data;
        console.log('AuthContext: Login response received:', { token: token ? 'exists' : 'missing', refreshToken: refreshToken ? 'exists' : 'missing', user });
        
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify({ ...user, _id: user._id || user.id }));
        setToken(token);
        setRefreshToken(refreshToken);
        setUser({ ...user, _id: user._id || user.id }); // Ensure _id is always set
        console.log('AuthContext: User data stored and state updated');
        
        // Redirect based on user role
        if (user.role === 'admin') {
            console.log('AuthContext: Redirecting to admin dashboard');
            navigate('/admin/dashboard');
        } else if (user.role === 'facility_owner') {
            console.log('AuthContext: Redirecting to owner dashboard');
            navigate('/owner/dashboard');
        } else {
            console.log('AuthContext: Redirecting to home page');
            navigate('/');
        }
    };

    const signup = async (userData: FormData) => {
        const response = await axios.post(`${API_URL}/signup`, userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; 
    };

    const verifyOtp = async (userId: string, otp: string) => { // Explicitly type parameters
        const response = await axios.post(`${API_URL}/verify-otp`, { userId, otp });
        return response.data;
    };

  const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        navigate('/login');
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value: AuthContextType = {
        user,
        token,
        refreshToken,
        loading,
        login,
        signup,
        verifyOtp,
        logout,
        updateUser, // Added updateUser to the context value
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
