import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks } from '../../hooks/useTasks';
import apiClient from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

describe('useTasks hook', () => {
  const mockUser = { id: 1, username: 'testuser' };
  let tasks, setTasks;

  beforeEach(() => {
    vi.clearAllMocks();
    tasks = [];
    setTasks = vi.fn((value) => {
      if (typeof value === 'function') {
        tasks = value(tasks);
      } else {
        tasks = value;
      }
    });
  });

  describe('fetchTasks', () => {
    it('should fetch tasks for authenticated user', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
      ];
      apiClient.getTasks.mockResolvedValueOnce(mockTasks);

      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(apiClient.getTasks).toHaveBeenCalledOnce();
      expect(setTasks).toHaveBeenCalledWith(mockTasks);
    });

    it('should not fetch tasks without user', async () => {
      const { result } = renderHook(() => useTasks(tasks, setTasks, null));

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(apiClient.getTasks).not.toHaveBeenCalled();
    });

    it('should handle fetch error', async () => {
      apiClient.getTasks.mockRejectedValueOnce(new Error('Fetch failed'));

      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(result.current.error).toContain('Cannot fetch tasks');
    });
  });

  describe('addTask', () => {
    it('should add a new task', async () => {
      const newTask = { title: 'New task', priority: 'high' };
      const created = { id: 1, ...newTask };
      apiClient.createTask.mockResolvedValueOnce(created);

      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      let addedTask;
      await act(async () => {
        addedTask = await result.current.addTask(newTask);
      });

      expect(apiClient.createTask).toHaveBeenCalledWith(newTask);
      expect(addedTask).toEqual(created);
      expect(setTasks).toHaveBeenCalled();
    });

    it('should reject empty task title', async () => {
      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      await act(async () => {
        await result.current.addTask({ title: '' });
      });

      expect(result.current.error).toContain('Please enter a task title');
      expect(apiClient.createTask).not.toHaveBeenCalled();
    });

    it('should handle add error', async () => {
      apiClient.createTask.mockRejectedValueOnce(
        new Error('Create failed')
      );

      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      await act(async () => {
        await result.current.addTask({ title: 'Task' });
      });

      expect(result.current.error).toContain('Error adding task');
    });
  });

  describe('updateTask', () => {
    it('should update a task', async () => {
      const updates = { title: 'Updated' };
      const updated = { id: 1, ...updates };
      apiClient.updateTask.mockResolvedValueOnce(updated);

      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      await act(async () => {
        await result.current.updateTask(1, updates);
      });

      expect(apiClient.updateTask).toHaveBeenCalledWith(1, updates);
      expect(setTasks).toHaveBeenCalled();
    });

    it('should handle update error', async () => {
      apiClient.updateTask.mockRejectedValueOnce(
        new Error('Update failed')
      );

      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      await act(async () => {
        await result.current.updateTask(1, { title: 'Updated' });
      });

      expect(result.current.error).toContain('Error updating task');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      apiClient.deleteTask.mockResolvedValueOnce(null);
      tasks = [{ id: 1, title: 'Task to delete' }];

      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      await act(async () => {
        await result.current.deleteTask(1);
      });

      expect(apiClient.deleteTask).toHaveBeenCalledWith(1);
      expect(setTasks).toHaveBeenCalled();
    });

    it('should handle delete error', async () => {
      apiClient.deleteTask.mockRejectedValueOnce(
        new Error('Delete failed')
      );

      const { result } = renderHook(() =>
        useTasks(tasks, setTasks, mockUser)
      );

      await act(async () => {
        await result.current.deleteTask(1);
      });

      expect(result.current.error).toContain('Error deleting task');
    });
  });
});
