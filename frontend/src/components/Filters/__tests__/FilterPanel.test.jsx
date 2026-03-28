import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '../FilterPanel';

describe('FilterPanel Component', () => {
  const mockFilter = {
    search: '',
    priority: '',
    category: '',
    completed: '',
  };
  const mockOnFilterChange = vi.fn();
  const mockOnSortByChange = vi.fn();
  const mockOnSortDirectionChange = vi.fn();
  const mockOnReset = vi.fn();

  it('should render all filter controls', () => {
    render(
      <FilterPanel
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        sortBy="id"
        onSortByChange={mockOnSortByChange}
        sortDirection="asc"
        onSortDirectionChange={mockOnSortDirectionChange}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Priorities')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Categories')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Tasks')).toBeInTheDocument();
  });

  it('should update search filter', async () => {
    const user = userEvent.setup();

    render(
      <FilterPanel
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        sortBy="id"
        onSortByChange={mockOnSortByChange}
        sortDirection="asc"
        onSortDirectionChange={mockOnSortDirectionChange}
        onReset={mockOnReset}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    await user.type(searchInput, 'test');

    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('should update priority filter', async () => {
    const user = userEvent.setup();

    render(
      <FilterPanel
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        sortBy="id"
        onSortByChange={mockOnSortByChange}
        sortDirection="asc"
        onSortDirectionChange={mockOnSortDirectionChange}
        onReset={mockOnReset}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const prioritySelect = selects[0];

    await user.selectOptions(prioritySelect, 'high');

    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('should call onReset when Reset Filters button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <FilterPanel
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        sortBy="title"
        onSortByChange={mockOnSortByChange}
        sortDirection="desc"
        onSortDirectionChange={mockOnSortDirectionChange}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('Reset Filters');
    await user.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledOnce();
  });

  it('should update sort field', async () => {
    const user = userEvent.setup();

    render(
      <FilterPanel
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        sortBy="title"
        onSortByChange={mockOnSortByChange}
        sortDirection="asc"
        onSortDirectionChange={mockOnSortDirectionChange}
        onReset={mockOnReset}
      />
    );

    const sortSelects = screen.getAllByRole('combobox');
    // The second to last select is usually the sort-by field
    const sortBySelect = sortSelects[sortSelects.length - 2];

    await user.selectOptions(sortBySelect, 'priority');

    expect(mockOnSortByChange).toHaveBeenCalled();
  });

  it('should update sort direction', async () => {
    const user = userEvent.setup();

    render(
      <FilterPanel
        filter={mockFilter}
        onFilterChange={mockOnFilterChange}
        sortBy="id"
        onSortByChange={mockOnSortByChange}
        sortDirection="asc"
        onSortDirectionChange={mockOnSortDirectionChange}
        onReset={mockOnReset}
      />
    );

    const sortSelects = screen.getAllByRole('combobox');
    // The last select is usually the sort direction field
    const sortDirectionSelect = sortSelects[sortSelects.length - 1];

    await user.selectOptions(sortDirectionSelect, 'desc');

    expect(mockOnSortDirectionChange).toHaveBeenCalled();
  });
});
