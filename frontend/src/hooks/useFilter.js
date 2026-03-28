import { useState, useMemo } from 'react';

/**
 * Custom hook for managing filtering and sorting of tasks
 */
export function useFilter(tasks) {
    const [filter, setFilter] = useState({
        search: '',
        priority: '',
        category: '',
        completed: '',
    });
    const [sortBy, setSortBy] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    const filteredAndSortedTasks = useMemo(() => {
        return tasks
            .filter((task) => {
                const matchesSearch = task.title
                    .toLowerCase()
                    .includes(filter.search.toLowerCase());
                const matchesPriority =
                    !filter.priority || task.priority === filter.priority;
                const matchesCategory =
                    !filter.category || task.category === filter.category;
                const matchesCompleted =
                    !filter.completed ||
                    task.completed.toString() === filter.completed;

                return (
                    matchesSearch &&
                    matchesPriority &&
                    matchesCategory &&
                    matchesCompleted
                );
            })
            .sort((a, b) => {
                if (sortBy === 'completed') {
                    return sortDirection === 'asc'
                        ? a.completed === b.completed
                            ? 0
                            : a.completed
                            ? 1
                            : -1
                        : a.completed === b.completed
                        ? 0
                        : a.completed
                        ? -1
                        : 1;
                }

                if (a[sortBy] < b[sortBy])
                    return sortDirection === 'asc' ? -1 : 1;
                if (a[sortBy] > b[sortBy])
                    return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [tasks, filter, sortBy, sortDirection]);

    const resetFilters = () => {
        setFilter({
            search: '',
            priority: '',
            category: '',
            completed: '',
        });
        setSortBy('id');
        setSortDirection('asc');
    };

    return {
        filter,
        setFilter,
        sortBy,
        setSortBy,
        sortDirection,
        setSortDirection,
        filteredAndSortedTasks,
        resetFilters,
    };
}
