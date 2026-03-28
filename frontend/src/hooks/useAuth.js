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
            setError('');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (demoMode = false) => {
        try {
            setLoading(true);
            setError('');

            if (demoMode) {
                // Demo mode: create a demo user without OAuth
                const demoUser = {
                    id: 'demo-user',
                    username: 'Demo User',
                    email: 'demo@taskmaster.local',
                    picture: null,
                };
                setUser(demoUser);
                localStorage.setItem('demo_mode', 'true');
                localStorage.setItem('demo_user', JSON.stringify(demoUser));
            } else {
                // Google OAuth mode
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                window.location.href = `${API_URL}/auth/google`;
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to initiate login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            const isDemo = localStorage.getItem('demo_mode') === 'true';

            if (isDemo) {
                // Demo mode logout
                localStorage.removeItem('demo_mode');
                localStorage.removeItem('demo_user');
                setUser(null);
            } else {
                // OAuth logout
                await apiClient.logout();
                setUser(null);
            }
        } catch (err) {
            console.error('Logout error:', err);
            setError('Failed to logout');
        } finally {
            setLoading(false);
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

