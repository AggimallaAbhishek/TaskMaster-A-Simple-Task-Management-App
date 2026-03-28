import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from '../FilterPanel';

// Mock the usePresets hook
vi.mock('../../../hooks', () => ({
  usePresets: () => ({
    presets: [],
    loading: false,
    fetchPresets: vi.fn(),
    createPreset: vi.fn(async () => ({ id: 1, name: 'Test Preset' })),
    updatePreset: vi.fn(),
    deletePreset: vi.fn(),
    applyPreset: vi.fn(async () => ({ preset: {}, tasks: [] })),
  }),
}));

describe('FilterPanel Component', () => {
  let mockFilter;
  let mockOnFilterChange;
  let mockOnSortByChange;
  let mockOnSortDirectionChange;
  let mockOnReset;

  beforeEach(() => {
    mockFilter = {
      search: '',
      priority: '',
      category: '',
      completed: '',
      dueDateFrom: '',
      dueDateTo: '',
    };
    mockOnFilterChange = vi.fn();
    mockOnSortByChange = vi.fn();
    mockOnSortDirectionChange = vi.fn();
    mockOnReset = vi.fn();
  });

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

  it('should render Advanced button', () => {
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

    expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
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

  it('should show advanced filters when Advanced button clicked', async () => {
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

    const advancedButton = screen.getByRole('button', { name: /advanced/i });
    await user.click(advancedButton);

    await waitFor(() => {
      expect(screen.getByText('Due Date Range')).toBeInTheDocument();
      expect(screen.getByText('Filter Presets')).toBeInTheDocument();
    });
  });

  it('should hide advanced filters when Hide Advanced button clicked', async () => {
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

    // Open advanced
    let advancedButton = screen.getByRole('button', { name: /advanced/i });
    await user.click(advancedButton);

    await waitFor(() => {
      expect(screen.getByText('Due Date Range')).toBeInTheDocument();
    });

    // Close advanced
    advancedButton = screen.getByRole('button', { name: /hide advanced/i });
    await user.click(advancedButton);

    await waitFor(() => {
      expect(screen.queryByText('Due Date Range')).not.toBeInTheDocument();
    });
  });

  it('should update date range when dates are set', async () => {
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

    // Open advanced
    const advancedButton = screen.getByRole('button', { name: /advanced/i });
    await user.click(advancedButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Start date for date range filter')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText('Start date for date range filter');
    await user.type(startDateInput, '2024-03-24');

    expect(mockOnFilterChange).toHaveBeenCalled();
  });
});
