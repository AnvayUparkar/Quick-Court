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
    login: (email: string, password: string, options?: { skipRedirect?: boolean }) => Promise<any>;
    signup: (userData: FormData) => Promise<any>;
    verifyOtp: (email: string, otp: string) => Promise<any>; // Changed userId to email
    resendOtp: (email: string) => Promise<any>; // Changed userId to email
    logout: () => void;
    updateUser: (userData: User) => void; // Added updateUser function
    // Modal helpers to open a login/signup modal from anywhere
    openAuthModal: (mode?: 'login' | 'signup', redirectAfterLogin?: string | null) => void;
    closeAuthModal: () => void;
    isAuthModalOpen?: boolean;
    authModalMode?: 'login' | 'signup';
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null); // Explicitly type user state
    const [token, setToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
    const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
    const navigate = useNavigate();

    const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`; 

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
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser({ ...parsedUser, _id: parsedUser._id || parsedUser.id }); // Ensure _id is always set
                    console.log('AuthContext: User loaded from localStorage:', parsedUser);
                } catch (error) {
                    console.error("AuthContext: Error parsing stored user data:", error);
                    // Clear invalid data if parsing fails
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                }
            } else if (!storedToken && storedRefreshToken) {
                // If token missing but refresh token exists, try to refresh tokens
                try {
                    console.log('AuthContext: Attempting to refresh token using stored refreshToken');
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refreshToken: storedRefreshToken })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const { token: newToken, refreshToken: newRefreshToken, user: refreshedUser } = data;
                        localStorage.setItem('token', newToken);
                        localStorage.setItem('refreshToken', newRefreshToken);
                        localStorage.setItem('user', JSON.stringify({ ...refreshedUser, _id: refreshedUser._id || refreshedUser.id }));
                        setToken(newToken);
                        setRefreshToken(newRefreshToken);
                        setUser({ ...refreshedUser, _id: refreshedUser._id || refreshedUser.id });
                        console.log('AuthContext: Token refreshed successfully on load');
                    } else {
                        console.warn('AuthContext: Refresh token invalid or expired during load');
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                    }
                } catch (err) {
                    console.error('AuthContext: Error while refreshing token on load', err);
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                }
            } else {
                console.log('AuthContext: Missing required authentication data');
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string, options?: { skipRedirect?: boolean }) => { // Explicitly type parameters
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
        
        // If caller requested to handle redirect themselves, return user and avoid navigating here
        if (options?.skipRedirect) {
            return user;
        }

        // If a redirect was requested before login (e.g. booking -> payment), honor it
        if (redirectAfterLogin) {
            const redirectTo = redirectAfterLogin;
            setRedirectAfterLogin(null);
            setIsAuthModalOpen(false);
            console.log('AuthContext: Redirecting to saved path after login:', redirectTo);
            navigate(redirectTo);
            return;
        }

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
        return user;
    };

    const openAuthModal = (mode: 'login' | 'signup' = 'login', redirect?: string | null) => {
        setAuthModalMode(mode);
        setRedirectAfterLogin(redirect || null);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
        setRedirectAfterLogin(null);
    };

    const signup = async (userData: FormData) => {
        const response = await axios.post(`${API_URL}/signup`, userData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; 
    };

    const verifyOtp = async (email: string, otp: string) => { // Changed userId to email
        const response = await axios.post(`${API_URL}/verify-otp`, { email, otp });
        return response.data;
    };

    const resendOtp = async (email: string) => { // Changed userId to email
        const response = await axios.post(`${API_URL}/resend-otp`, { email });
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
        resendOtp, // Add resendOtp to the context value
        logout,
        updateUser, // Added updateUser to the context value
        openAuthModal,
        closeAuthModal,
        isAuthModalOpen,
        authModalMode,
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
