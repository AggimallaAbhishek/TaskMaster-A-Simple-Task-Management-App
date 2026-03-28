import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilter } from '../../hooks/useFilter';

describe('useFilter hook', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'High priority task',
      priority: 'high',
      category: 'work',
      completed: false,
    },
    {
      id: 2,
      title: 'Medium priority task',
      priority: 'medium',
      category: 'learning',
      completed: true,
    },
    {
      id: 3,
      title: 'Low priority task',
      priority: 'low',
      category: 'personal',
      completed: false,
    },
  ];

  it('should initialize with default filter state', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    expect(result.current.filter).toEqual({
      search: '',
      priority: '',
      category: '',
      completed: '',
    });
    expect(result.current.sortBy).toBe('id');
    expect(result.current.sortDirection).toBe('asc');
  });

  it('should return all tasks when no filter applied', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    expect(result.current.filteredAndSortedTasks).toHaveLength(3);
  });

  it('should filter tasks by search term', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setFilter({
        search: 'High priority',
        priority: '',
        category: '',
        completed: '',
      });
    });

    expect(result.current.filteredAndSortedTasks).toHaveLength(1);
    expect(result.current.filteredAndSortedTasks[0].id).toBe(1);
  });

  it('should filter tasks by priority', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setFilter({
        search: '',
        priority: 'high',
        category: '',
        completed: '',
      });
    });

    expect(result.current.filteredAndSortedTasks).toHaveLength(1);
    expect(result.current.filteredAndSortedTasks[0].priority).toBe('high');
  });

  it('should filter tasks by category', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setFilter({
        search: '',
        priority: '',
        category: 'work',
        completed: '',
      });
    });

    expect(result.current.filteredAndSortedTasks).toHaveLength(1);
    expect(result.current.filteredAndSortedTasks[0].category).toBe('work');
  });

  it('should filter tasks by completion status', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setFilter({
        search: '',
        priority: '',
        category: '',
        completed: 'true',
      });
    });

    expect(result.current.filteredAndSortedTasks).toHaveLength(1);
    expect(result.current.filteredAndSortedTasks[0].completed).toBe(true);
  });

  it('should sort tasks by title in ascending order', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setSortBy('title');
      result.current.setSortDirection('asc');
    });

    const sorted = result.current.filteredAndSortedTasks;
    expect(sorted[0].title).toBe('High priority task');
    expect(sorted[1].title).toBe('Low priority task');
    expect(sorted[2].title).toBe('Medium priority task');
  });

  it('should sort tasks by title in descending order', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setSortBy('title');
      result.current.setSortDirection('desc');
    });

    const sorted = result.current.filteredAndSortedTasks;
    expect(sorted[0].title).toBe('Medium priority task');
  });

  it('should sort tasks by completion status', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setSortBy('completed');
      result.current.setSortDirection('asc');
    });

    const sorted = result.current.filteredAndSortedTasks;
    expect(sorted[0].completed).toBe(false);
    expect(sorted[1].completed).toBe(false);
    expect(sorted[2].completed).toBe(true);
  });

  it('should reset filters', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setFilter({
        search: 'test',
        priority: 'high',
        category: 'work',
        completed: 'true',
      });
      result.current.setSortBy('title');
      result.current.setSortDirection('desc');
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.filter).toEqual({
      search: '',
      priority: '',
      category: '',
      completed: '',
    });
    expect(result.current.sortBy).toBe('id');
    expect(result.current.sortDirection).toBe('asc');
    expect(result.current.filteredAndSortedTasks).toHaveLength(3);
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useFilter(mockTasks));

    act(() => {
      result.current.setFilter({
        search: 'task',
        priority: '',
        category: 'work',
        completed: 'false',
      });
    });

    expect(result.current.filteredAndSortedTasks).toHaveLength(1);
    expect(result.current.filteredAndSortedTasks[0].id).toBe(1);
  });
});
