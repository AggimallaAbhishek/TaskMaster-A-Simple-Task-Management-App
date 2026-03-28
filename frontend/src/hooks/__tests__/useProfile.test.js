import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useProfile } from '../useProfile';
import apiClient from '../../api/client';

// Mock the API client
vi.mock('../../api/client', () => ({
  default: {
    request: vi.fn(),
  },
}));

describe('useProfile Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize with null profile and no error', () => {
    const { result } = renderHook(() => useProfile());

    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should fetch profile successfully', async () => {
    const mockProfile = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      bio: 'Test bio',
      theme: 'light',
      notifications_enabled: true,
    };

    apiClient.request.mockResolvedValueOnce(mockProfile);

    const { result } = renderHook(() => useProfile());

    // Fetch profile
    await act(async () => {
      await result.current.fetchProfile();
    });

    await waitFor(() => {
      expect(result.current.profile).toEqual(mockProfile);
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch');
    apiClient.request.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProfile());

    // Attempt to fetch
    await act(async () => {
      try {
        await result.current.fetchProfile();
      } catch (err) {
        // Error is expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch');
    });
    expect(result.current.profile).toBeNull();
  });

  it('should update profile successfully', async () => {
    const initialProfile = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      bio: 'Old bio',
      theme: 'light',
    };

    const updatedProfile = {
      ...initialProfile,
      bio: 'New bio',
      theme: 'dark',
    };

    apiClient.request.mockResolvedValueOnce(updatedProfile);

    const { result } = renderHook(() => useProfile());

    // Update profile
    await act(async () => {
      await result.current.updateProfile({ bio: 'New bio', theme: 'dark' });
    });

    await waitFor(() => {
      expect(result.current.profile).toEqual(updatedProfile);
    });
    expect(apiClient.request).toHaveBeenCalledWith(
      '/api/users/profile',
      expect.objectContaining({
        method: 'PUT',
      })
    );
  });

  it('should handle update error', async () => {
    const error = new Error('Update failed');
    apiClient.request.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProfile());

    // Attempt update
    await act(async () => {
      try {
        await result.current.updateProfile({ bio: 'New bio' });
      } catch (err) {
        // Error is expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Update failed');
    });
  });

  it('should delete avatar successfully', async () => {
    const profile = {
      id: 1,
      username: 'testuser',
      avatar_path: '/avatars/user.jpg',
    };

    apiClient.request.mockResolvedValueOnce({
      message: 'Avatar deleted successfully',
    });

    const { result } = renderHook(() => useProfile());

    // Set initial profile
    await act(async () => {
      // Manually set profile
      result.current.profile = profile;
    });

    // Delete avatar
    await act(async () => {
      await result.current.deleteAvatar();
    });

    await waitFor(() => {
      expect(result.current.profile.avatar_path).toBeNull();
    });
    expect(apiClient.request).toHaveBeenCalledWith(
      '/api/users/avatar',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('should set loading state during fetch', async () => {
    const mockProfile = {
      id: 1,
      username: 'testuser',
    };

    // Use a promise that we can control
    let resolveRequest;
    const fetchPromise = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    apiClient.request.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => useProfile());

    // Start fetch
    act(() => {
      result.current.fetchProfile(); // Don't await yet
    });

    // Initially should be loading
    expect(result.current.loading).toBe(true);

    // Resolve the promise
    act(() => {
      resolveRequest(mockProfile);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle notifications_enabled toggle', async () => {
    const updatedProfile = {
      id: 1,
      notifications_enabled: false,
    };

    apiClient.request.mockResolvedValueOnce(updatedProfile);

    const { result } = renderHook(() => useProfile());

    await act(async () => {
      await result.current.updateProfile({ notifications_enabled: false });
    });

    await waitFor(() => {
      expect(result.current.profile.notifications_enabled).toBe(false);
    });
  });

  it('should clear error on successful operation', async () => {
    const error = new Error('Initial error');
    apiClient.request.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useProfile());

    // Cause an error
    await act(async () => {
      try {
        await result.current.fetchProfile();
      } catch (err) {
        // Error expected
      }
    });

    expect(result.current.error).toBe('Initial error');

    // Now succeed
    const mockProfile = { id: 1, username: 'test' };
    apiClient.request.mockResolvedValueOnce(mockProfile);

    await act(async () => {
      await result.current.fetchProfile();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.profile).toEqual(mockProfile);
    });
  });
});
