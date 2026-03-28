import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '../TaskForm';

describe('TaskForm Component', () => {
  const mockOnTitleChange = vi.fn();
  const mockOnPriorityChange = vi.fn();
  const mockOnCategoryChange = vi.fn();
  const mockOnDueDateChange = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockOnKeyPress = vi.fn();

  it('should render form inputs', () => {
    render(
      <TaskForm
        title=""
        onTitleChange={mockOnTitleChange}
        priority="medium"
        onPriorityChange={mockOnPriorityChange}
        category="general"
        onCategoryChange={mockOnCategoryChange}
        dueDate=""
        onDueDateChange={mockOnDueDateChange}
        onSubmit={mockOnSubmit}
        onKeyPress={mockOnKeyPress}
        loading={false}
      />
    );

    expect(screen.getByPlaceholderText('Enter a new task...')).toBeInTheDocument();
    expect(screen.getByText('Add Task')).toBeInTheDocument();
  });

  it('should update title input', async () => {
    const user = userEvent.setup();

    render(
      <TaskForm
        title=""
        onTitleChange={mockOnTitleChange}
        priority="medium"
        onPriorityChange={mockOnPriorityChange}
        category="general"
        onCategoryChange={mockOnCategoryChange}
        dueDate=""
        onDueDateChange={mockOnDueDateChange}
        onSubmit={mockOnSubmit}
        onKeyPress={mockOnKeyPress}
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText('Enter a new task...');
    await user.type(input, 'New task');

    expect(mockOnTitleChange).toHaveBeenCalled();
  });

  it('should call onSubmit when Add Task button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TaskForm
        title="Test task"
        onTitleChange={mockOnTitleChange}
        priority="medium"
        onPriorityChange={mockOnPriorityChange}
        category="general"
        onCategoryChange={mockOnCategoryChange}
        dueDate=""
        onDueDateChange={mockOnDueDateChange}
        onSubmit={mockOnSubmit}
        onKeyPress={mockOnKeyPress}
        loading={false}
      />
    );

    const button = screen.getByText('Add Task');
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledOnce();
  });

  it('should disable form when loading', () => {
    render(
      <TaskForm
        title=""
        onTitleChange={mockOnTitleChange}
        priority="medium"
        onPriorityChange={mockOnPriorityChange}
        category="general"
        onCategoryChange={mockOnCategoryChange}
        dueDate=""
        onDueDateChange={mockOnDueDateChange}
        onSubmit={mockOnSubmit}
        onKeyPress={mockOnKeyPress}
        loading={true}
      />
    );

    expect(screen.getByPlaceholderText('Enter a new task...')).toBeDisabled();
    expect(screen.getByText('Adding...')).toBeDisabled();
  });

  it('should call onKeyPress when Enter is pressed', async () => {
    const user = userEvent.setup();

    render(
      <TaskForm
        title=""
        onTitleChange={mockOnTitleChange}
        priority="medium"
        onPriorityChange={mockOnPriorityChange}
        category="general"
        onCategoryChange={mockOnCategoryChange}
        dueDate=""
        onDueDateChange={mockOnDueDateChange}
        onSubmit={mockOnSubmit}
        onKeyPress={mockOnKeyPress}
        loading={false}
      />
    );

    const input = screen.getByPlaceholderText('Enter a new task...');
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(mockOnKeyPress).toHaveBeenCalled();
  });

  it('should update priority selection', async () => {
    const user = userEvent.setup();

    render(
      <TaskForm
        title=""
        onTitleChange={mockOnTitleChange}
        priority="medium"
        onPriorityChange={mockOnPriorityChange}
        category="general"
        onCategoryChange={mockOnCategoryChange}
        dueDate=""
        onDueDateChange={mockOnDueDateChange}
        onSubmit={mockOnSubmit}
        onKeyPress={mockOnKeyPress}
        loading={false}
      />
    );

    const selects = screen.getAllByRole('combobox');
    const prioritySelect = selects[0];

    await user.selectOptions(prioritySelect, 'high');

    expect(mockOnPriorityChange).toHaveBeenCalled();
  });
});
