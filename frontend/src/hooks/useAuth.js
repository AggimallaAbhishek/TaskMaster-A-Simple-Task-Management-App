import { useState, useEffect } from 'react';
import apiClient from '../api/client';

/**
 * Custom hook for managing authentication state
 * Handles login, logout, and auth status checking
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            setError('');
            const userData = await apiClient.checkAuth();
            setUser(userData);
        } catch (err) {
            console.error('Auth check error:', err);
            setError('Failed to check authentication status');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = () => {
        const API_URL = import.meta.env.VITE_API_URL || 'https://taskmaster-a-simple-task-management-app.onrender.com';
        window.location.href = `${API_URL}/auth/google`;
    };

    const logout = async () => {
        try {
            await apiClient.logout();
            setUser(null);
        } catch (err) {
            console.error('Logout error:', err);
            setError('Failed to logout');
        }
    };

    return {
        user,
        loading,
        error,
        login,
        logout,
    };
}
