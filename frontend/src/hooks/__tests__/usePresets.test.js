import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePresets } from '../usePresets';
import apiClient from '../../api/client';

// Mock the API client
vi.mock('../../api/client', () => ({
  default: {
    request: vi.fn(),
  },
}));

describe('usePresets Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty presets and no error', () => {
    const { result } = renderHook(() => usePresets());

    expect(result.current.presets).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should fetch presets successfully', async () => {
    const mockPresets = [
      {
        id: 1,
        name: 'High priority',
        description: 'High priority tasks',
        filter_config: { priority: 'high' },
      },
      {
        id: 2,
        name: 'This week',
        description: 'Tasks due this week',
        filter_config: { dueDateFrom: '2024-03-24', dueDateTo: '2024-03-31' },
      },
    ];

    apiClient.request.mockResolvedValueOnce(mockPresets);

    const { result } = renderHook(() => usePresets());

    await act(async () => {
      await result.current.fetchPresets();
    });

    await waitFor(() => {
      expect(result.current.presets).toEqual(mockPresets);
    });
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch presets error', async () => {
    const error = new Error('Failed to fetch');
    apiClient.request.mockRejectedValueOnce(error);

    const { result } = renderHook(() => usePresets());

    await act(async () => {
      try {
        await result.current.fetchPresets();
      } catch (err) {
        // Error expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch');
    });
  });

  it('should create preset successfully', async () => {
    const newPreset = {
      id: 1,
      name: 'High priority',
      description: 'High priority tasks',
      filter_config: { priority: 'high' },
    };

    apiClient.request.mockResolvedValueOnce(newPreset);

    const { result } = renderHook(() => usePresets());

    await act(async () => {
      await result.current.createPreset('High priority', 'High priority tasks', {
        priority: 'high',
      });
    });

    await waitFor(() => {
      expect(result.current.presets).toContainEqual(newPreset);
    });
    expect(apiClient.request).toHaveBeenCalledWith(
      '/api/filter-presets',
      expect.objectContaining({
        method: 'POST',
      })
    );
  });

  it('should update preset successfully', async () => {
    const initialPreset = {
      id: 1,
      name: 'High priority',
      description: 'High priority tasks',
      filter_config: { priority: 'high' },
    };

    const updatedPreset = {
      ...initialPreset,
      description: 'Updated description',
    };

    apiClient.request.mockResolvedValueOnce(updatedPreset);

    const { result } = renderHook(() => usePresets());

    // Set initial presets
    await act(async () => {
      result.current.presets.push(initialPreset);
    });

    await act(async () => {
      await result.current.updatePreset(1, 'High priority', 'Updated description', {
        priority: 'high',
      });
    });

    await waitFor(() => {
      expect(result.current.presets[0].description).toBe('Updated description');
    });
  });

  it('should delete preset successfully', async () => {
    const preset = {
      id: 1,
      name: 'High priority',
      filter_config: { priority: 'high' },
    };

    apiClient.request.mockResolvedValueOnce({ message: 'Deleted' });

    const { result } = renderHook(() => usePresets());

    // Set initial presets
    await act(async () => {
      result.current.presets.push(preset);
    });

    expect(result.current.presets).toHaveLength(1);

    await act(async () => {
      await result.current.deletePreset(1);
    });

    await waitFor(() => {
      expect(result.current.presets).toHaveLength(0);
    });
  });

  it('should apply preset and return filtered tasks', async () => {
    const presetWithTasks = {
      preset: {
        id: 1,
        name: 'High priority',
        filter_config: { priority: 'high' },
      },
      tasks: [
        { id: 1, title: 'Urgent task', priority: 'high' },
      ],
    };

    apiClient.request.mockResolvedValueOnce(presetWithTasks);

    const { result } = renderHook(() => usePresets());

    let appliedResult;
    await act(async () => {
      appliedResult = await result.current.applyPreset(1);
    });

    await waitFor(() => {
      expect(appliedResult.tasks).toHaveLength(1);
      expect(appliedResult.tasks[0].priority).toBe('high');
    });
  });

  it('should set loading state during fetch', async () => {
    let resolveRequest;
    const fetchPromise = new Promise((resolve) => {
      resolveRequest = resolve;
    });

    apiClient.request.mockReturnValueOnce(fetchPromise);

    const { result } = renderHook(() => usePresets());

    act(() => {
      result.current.fetchPresets();
    });

    expect(result.current.loading).toBe(true);

    act(() => {
      resolveRequest([]);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should clear error on successful operation', async () => {
    const error = new Error('Initial error');
    apiClient.request.mockRejectedValueOnce(error);

    const { result } = renderHook(() => usePresets());

    await act(async () => {
      try {
        await result.current.fetchPresets();
      } catch (err) {
        // Error expected
      }
    });

    expect(result.current.error).toBe('Initial error');

    const mockPresets = [{ id: 1, name: 'Preset 1', filter_config: {} }];
    apiClient.request.mockResolvedValueOnce(mockPresets);

    await act(async () => {
      await result.current.fetchPresets();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.presets).toEqual(mockPresets);
    });
  });
});
