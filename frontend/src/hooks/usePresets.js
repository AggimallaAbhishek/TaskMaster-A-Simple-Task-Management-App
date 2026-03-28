import { useState, useCallback } from 'react';
import apiClient from '../api/client';

/**
 * usePresets - Custom hook for filter preset management
 *
 * Provides:
 * - Fetching user's filter presets
 * - Creating new presets
 * - Updating existing presets
 * - Deleting presets
 * - Applying presets (fetching filtered tasks)
 * - Loading and error states
 */
export const usePresets = () => {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all presets for user
  const fetchPresets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.request('/api/filter-presets');
      setPresets(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch presets');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new preset
  const createPreset = useCallback(async (name, description, filterConfig) => {
    setLoading(true);
    setError(null);
    try {
      const preset = await apiClient.request('/api/filter-presets', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          filter_config: filterConfig,
        }),
      });
      setPresets((prev) => [...prev, preset]);
      return preset;
    } catch (err) {
      setError(err.message || 'Failed to create preset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing preset
  const updatePreset = useCallback(async (id, name, description, filterConfig) => {
    setLoading(true);
    setError(null);
    try {
      const updatedPreset = await apiClient.request(`/api/filter-presets/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          description,
          filter_config: filterConfig,
        }),
      });
      setPresets((prev) =>
        prev.map((p) => (p.id === id ? updatedPreset : p))
      );
      return updatedPreset;
    } catch (err) {
      setError(err.message || 'Failed to update preset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete preset
  const deletePreset = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.request(`/api/filter-presets/${id}`, {
        method: 'DELETE',
      });
      setPresets((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete preset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply preset and get filtered tasks
  const applyPreset = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.request(`/api/filter-presets/${id}/apply`, {
        method: 'POST',
      });
      return result;
    } catch (err) {
      setError(err.message || 'Failed to apply preset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    presets,
    loading,
    error,
    fetchPresets,
    createPreset,
    updatePreset,
    deletePreset,
    applyPreset,
  };
};
