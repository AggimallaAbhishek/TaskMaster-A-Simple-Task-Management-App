import { useState, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * useProfile - Custom hook for user profile management
 *
 * Provides:
 * - Fetching user profile data
 * - Updating profile (bio, theme, notifications)
 * - Deleting avatar
 * - Loading and error states
 */
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.request('/api/users/profile');
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await apiClient.request('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete avatar
  const deleteAvatar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.request('/api/users/avatar', {
        method: 'DELETE',
      });
      // Update profile with avatar_path set to null
      setProfile((prev) => ({
        ...prev,
        avatar_path: null,
      }));
      return response;
    } catch (err) {
      setError(err.message || 'Failed to delete avatar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    deleteAvatar,
  };
};
