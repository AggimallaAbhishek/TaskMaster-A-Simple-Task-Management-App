import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from '../DateRangePicker';
import { PresetManager } from '../PresetManager';

describe('DateRangePicker Component', () => {
  it('should render date input fields', () => {
    const mockOnChange = vi.fn();

    render(
      <DateRangePicker
        startDate=""
        onStartDateChange={mockOnChange}
        endDate=""
        onEndDateChange={mockOnChange}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByLabelText('Start date for date range filter')).toBeInTheDocument();
    expect(screen.getByLabelText('End date for date range filter')).toBeInTheDocument();
  });

  it('should call onStartDateChange when start date changes', async () => {
    const user = userEvent.setup();
    const handleStartChange = vi.fn();

    render(
      <DateRangePicker
        startDate=""
        onStartDateChange={handleStartChange}
        endDate=""
        onEndDateChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    const startInput = screen.getByLabelText('Start date for date range filter');
    await user.type(startInput, '2024-03-24');

    expect(handleStartChange).toHaveBeenCalled();
  });

  it('should call onEndDateChange when end date changes', async () => {
    const user = userEvent.setup();
    const handleEndChange = vi.fn();

    render(
      <DateRangePicker
        startDate=""
        onStartDateChange={vi.fn()}
        endDate=""
        onEndDateChange={handleEndChange}
        onClear={vi.fn()}
      />
    );

    const endInput = screen.getByLabelText('End date for date range filter');
    await user.type(endInput, '2024-03-31');

    expect(handleEndChange).toHaveBeenCalled();
  });

  it('should show clear button when dates are set', () => {
    render(
      <DateRangePicker
        startDate="2024-03-24"
        onStartDateChange={vi.fn()}
        endDate="2024-03-31"
        onEndDateChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /clear date range/i })).toBeInTheDocument();
  });

  it('should call onClear when clear button clicked', async () => {
    const user = userEvent.setup();
    const handleClear = vi.fn();

    render(
      <DateRangePicker
        startDate="2024-03-24"
        onStartDateChange={vi.fn()}
        endDate="2024-03-31"
        onEndDateChange={vi.fn()}
        onClear={handleClear}
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear date range/i });
    await user.click(clearButton);

    expect(handleClear).toHaveBeenCalledOnce();
  });

  it('should not show clear button when no dates set', () => {
    render(
      <DateRangePicker
        startDate=""
        onStartDateChange={vi.fn()}
        endDate=""
        onEndDateChange={vi.fn()}
        onClear={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: /clear date range/i })).not.toBeInTheDocument();
  });
});

describe('PresetManager Component', () => {
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
      filter_config: { dueDateFrom: '2024-03-24' },
    },
  ];

  const mockCallbacks = {
    onSavePreset: vi.fn(),
    onLoadPreset: vi.fn(),
    onDeletePreset: vi.fn(),
  };

  it('should render save preset button', () => {
    render(
      <PresetManager
        presets={[]}
        loading={false}
        onSavePreset={mockCallbacks.onSavePreset}
        onLoadPreset={mockCallbacks.onLoadPreset}
        onDeletePreset={mockCallbacks.onDeletePreset}
        currentFilters={{}}
      />
    );

    expect(screen.getByRole('button', { name: /save current filter as preset/i })).toBeInTheDocument();
  });

  it('should show save form when save button clicked', async () => {
    const user = userEvent.setup();

    render(
      <PresetManager
        presets={[]}
        loading={false}
        onSavePreset={mockCallbacks.onSavePreset}
        onLoadPreset={mockCallbacks.onLoadPreset}
        onDeletePreset={mockCallbacks.onDeletePreset}
        currentFilters={{}}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current filter as preset/i });
    await user.click(saveButton);

    expect(screen.getByPlaceholderText('e.g., My Important Tasks')).toBeInTheDocument();
  });

  it('should display saved presets', () => {
    render(
      <PresetManager
        presets={mockPresets}
        loading={false}
        onSavePreset={mockCallbacks.onSavePreset}
        onLoadPreset={mockCallbacks.onLoadPreset}
        onDeletePreset={mockCallbacks.onDeletePreset}
        currentFilters={{}}
      />
    );

    expect(screen.getByText('High priority')).toBeInTheDocument();
    expect(screen.getByText('This week')).toBeInTheDocument();
  });

  it('should display preset descriptions', () => {
    render(
      <PresetManager
        presets={mockPresets}
        loading={false}
        onSavePreset={mockCallbacks.onSavePreset}
        onLoadPreset={mockCallbacks.onLoadPreset}
        onDeletePreset={mockCallbacks.onDeletePreset}
        currentFilters={{}}
      />
    );

    expect(screen.getByText('High priority tasks')).toBeInTheDocument();
    expect(screen.getByText('Tasks due this week')).toBeInTheDocument();
  });

  it('should call onLoadPreset when load button clicked', async () => {
    const user = userEvent.setup();

    render(
      <PresetManager
        presets={mockPresets}
        loading={false}
        onSavePreset={mockCallbacks.onSavePreset}
        onLoadPreset={mockCallbacks.onLoadPreset}
        onDeletePreset={mockCallbacks.onDeletePreset}
        currentFilters={{}}
      />
    );

    const loadButtons = screen.getAllByRole('button', { name: /load/i });
    await user.click(loadButtons[0]);

    expect(mockCallbacks.onLoadPreset).toHaveBeenCalledWith(1);
  });

  it('should call onDeletePreset when delete confirmed', async () => {
    const user = userEvent.setup();
    const confirmMock = vi.fn(() => true);
    const originalConfirm = window.confirm;
    window.confirm = confirmMock;

    try {
      render(
        <PresetManager
          presets={mockPresets}
          loading={false}
          onSavePreset={mockCallbacks.onSavePreset}
          onLoadPreset={mockCallbacks.onLoadPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          currentFilters={{}}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(confirmMock).toHaveBeenCalled();
      expect(mockCallbacks.onDeletePreset).toHaveBeenCalledWith(1);
    } finally {
      window.confirm = originalConfirm;
    }
  });

  it('should not call onDeletePreset when delete cancelled', async () => {
    const user = userEvent.setup();
    const confirmMock = vi.fn(() => false);
    const originalConfirm = window.confirm;
    window.confirm = confirmMock;

    try {
      render(
        <PresetManager
          presets={mockPresets}
          loading={false}
          onSavePreset={mockCallbacks.onSavePreset}
          onLoadPreset={mockCallbacks.onLoadPreset}
          onDeletePreset={mockCallbacks.onDeletePreset}
          currentFilters={{}}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(confirmMock).toHaveBeenCalled();
      expect(mockCallbacks.onDeletePreset).not.toHaveBeenCalled();
    } finally {
      window.confirm = originalConfirm;
    }
  });

  it('should call onSavePreset with form data', async () => {
    const user = userEvent.setup();

    render(
      <PresetManager
        presets={[]}
        loading={false}
        onSavePreset={mockCallbacks.onSavePreset}
        onLoadPreset={mockCallbacks.onLoadPreset}
        onDeletePreset={mockCallbacks.onDeletePreset}
        currentFilters={{ priority: 'high' }}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current filter as preset/i });
    await user.click(saveButton);

    const nameInput = screen.getByPlaceholderText('e.g., My Important Tasks');
    await user.type(nameInput, 'My Preset');

    const descInput = screen.getByPlaceholderText('Describe this preset...');
    await user.type(descInput, 'My description');

    const saveButtons = screen.getAllByRole('button', { name: /save/i });
    const submitButton = saveButtons.find(btn => btn.textContent.trim() === 'Save');
    await user.click(submitButton);

    expect(mockCallbacks.onSavePreset).toHaveBeenCalledWith(
      'My Preset',
      'My description',
      { priority: 'high' }
    );
  });

  it('should show error when preset name is empty', async () => {
    const user = userEvent.setup();

    render(
      <PresetManager
        presets={[]}
        loading={false}
        onSavePreset={mockCallbacks.onSavePreset}
        onLoadPreset={mockCallbacks.onLoadPreset}
        onDeletePreset={mockCallbacks.onDeletePreset}
        currentFilters={{}}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current filter as preset/i });
    await user.click(saveButton);

    const saveButtons = screen.getAllByRole('button', { name: /save/i });
    const submitButton = saveButtons.find(btn => btn.textContent.trim() === 'Save');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Preset name is required')).toBeInTheDocument();
    });
  });

  it('should hide save form when cancel clicked', async () => {
    const user = userEvent.setup();

    render(
      <PresetManager
        presets={[]}
        loading={false}
        onSavePreset={mockCallbacks.onSavePreset}
        onLoadPreset={mockCallbacks.onLoadPreset}
        onDeletePreset={mockCallbacks.onDeletePreset}
        currentFilters={{}}
      />
    );

    const saveButton = screen.getByRole('button', { name: /save current filter as preset/i });
    await user.click(saveButton);

    expect(screen.getByPlaceholderText('e.g., My Important Tasks')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel save preset/i });
    await user.click(cancelButton);

    expect(screen.queryByPlaceholderText('e.g., My Important Tasks')).not.toBeInTheDocument();
  });
});
