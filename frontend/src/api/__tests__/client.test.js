import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import apiClient from '../../api/client';

// Mock global fetch
global.fetch = vi.fn();

describe('API Client', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('request method', () => {
    it('should make a GET request with credentials', async () => {
      global.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, username: 'test' }), {
          status: 200,
          headers: { 'content-length': '1' },
        })
      );

      const result = await apiClient.request('/auth/user');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/user'),
        expect.objectContaining({
          credentials: 'include',
          method: 'GET',
        })
      );
      expect(result).toEqual({ id: 1, username: 'test' });
    });

    it('should throw error on non-ok response', async () => {
      global.fetch.mockResolvedValueOnce(
        new Response('Unauthorized', { status: 401 })
      );

      await expect(apiClient.request('/api/tasks')).rejects.toThrow();
    });

    it('should handle empty responses (204 No Content)', async () => {
      global.fetch.mockResolvedValueOnce(
        new Response(null, { status: 204 })
      );

      const result = await apiClient.request('/auth/logout', {
        method: 'POST',
      });

      expect(result).toBeNull();
    });

    it('should send JSON body for POST requests', async () => {
      const taskData = { title: 'Test task', priority: 'high' };
      global.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 1, ...taskData }), {
          status: 201,
          headers: { 'content-length': '1' },
        })
      );

      await apiClient.request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(taskData),
        })
      );
    });
  });

  describe('Auth methods', () => {
    it('should call checkAuth endpoint', async () => {
      const user = { id: 1, username: 'test' };
      global.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify(user), {
          status: 200,
          headers: { 'content-length': '1' },
        })
      );

      const result = await apiClient.checkAuth();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/user'),
        expect.any(Object)
      );
      expect(result).toEqual(user);
    });

    it('should call logout endpoint', async () => {
      global.fetch.mockResolvedValueOnce(
        new Response(null, { status: 200 })
      );

      await apiClient.logout();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/logout'),
        expect.any(Object)
      );
    });
  });

  describe('Task methods', () => {
    it('should fetch all tasks', async () => {
      const tasks = [
        { id: 1, title: 'Task 1' },
        { id: 2, title: 'Task 2' },
      ];
      global.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify(tasks), {
          status: 200,
          headers: { 'content-length': '1' },
        })
      );

      const result = await apiClient.getTasks();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.any(Object)
      );
      expect(result).toEqual(tasks);
    });

    it('should create a task', async () => {
      const newTask = { title: 'New task', priority: 'high' };
      const created = { id: 1, ...newTask };
      global.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify(created), {
          status: 201,
          headers: { 'content-length': '1' },
        })
      );

      const result = await apiClient.createTask(newTask);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result).toEqual(created);
    });

    it('should update a task', async () => {
      const updates = { title: 'Updated task' };
      const updated = { id: 1, ...updates };
      global.fetch.mockResolvedValueOnce(
        new Response(JSON.stringify(updated), {
          status: 200,
          headers: { 'content-length': '1' },
        })
      );

      const result = await apiClient.updateTask(1, updates);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/1'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
      expect(result).toEqual(updated);
    });

    it('should delete a task', async () => {
      global.fetch.mockResolvedValueOnce(
        new Response(null, { status: 200 })
      );

      await apiClient.deleteTask(1);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tasks/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
