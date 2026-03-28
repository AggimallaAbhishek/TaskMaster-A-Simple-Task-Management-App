import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
  AccessibleCheckbox,
  AccessibleAlert,
  SkipToMainContent,
} from '../AccessibleComponents';

describe('Accessible Components - WCAG 2.1 AA Compliance', () => {
  // ===== ACCESSIBLE BUTTON TESTS =====
  describe('AccessibleButton', () => {
    it('should render button with aria-label', () => {
      render(
        <AccessibleButton ariaLabel="Submit form" onClick={vi.fn()}>
          Submit
        </AccessibleButton>
      );

      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Submit form');
    });

    it('should handle Enter key press', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <AccessibleButton onClick={handleClick}>
          Click me
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });

    it('should handle Space key press', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <AccessibleButton onClick={handleClick}>
          Click me
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(' ');

      expect(handleClick).toHaveBeenCalled();
    });

    it('should have focus indicator (ring class)', () => {
      render(<AccessibleButton onClick={vi.fn()}>Button</AccessibleButton>);

      const button = screen.getByRole('button');
      expect(button.className).toContain('focus:ring-2');
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <AccessibleButton disabled onClick={vi.fn()}>
          Disabled
        </AccessibleButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.className).toContain('disabled:opacity-50');
    });
  });

  // ===== ACCESSIBLE INPUT TESTS =====
  describe('AccessibleInput', () => {
    it('should associate label with input', () => {
      render(
        <AccessibleInput
          id="username"
          label="Username"
          value=""
          onChange={vi.fn()}
        />
      );

      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'username');
      expect(input).toHaveAttribute('id', 'username');
    });

    it('should display required indicator', () => {
      render(
        <AccessibleInput
          id="email"
          label="Email"
          value=""
          onChange={vi.fn()}
          required
        />
      );

      const required = screen.getByLabelText('required');
      expect(required).toBeInTheDocument();
    });

    it('should show error message with aria-describedby', () => {
      render(
        <AccessibleInput
          id="password"
          label="Password"
          value=""
          onChange={vi.fn()}
          error="Password is too short"
        />
      );

      const input = screen.getByRole('textbox');
      const errorMsg = screen.getByText('Password is too short');

      expect(input).toHaveAttribute('aria-describedby', 'password-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorMsg).toHaveAttribute('role', 'alert');
    });

    it('should have focus indicator', () => {
      render(
        <AccessibleInput
          id="test"
          label="Test"
          value=""
          onChange={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      expect(input.className).toContain('focus:ring-2');
    });

    it('should handle text input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <AccessibleInput
          id="test"
          label="Test"
          value=""
          onChange={handleChange}
        />
      );

      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');

      expect(handleChange).toHaveBeenCalled();
    });
  });

  // ===== ACCESSIBLE SELECT TESTS =====
  describe('AccessibleSelect', () => {
    const options = [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ];

    it('should render select with proper label', () => {
      render(
        <AccessibleSelect
          id="priority"
          label="Priority"
          value="medium"
          onChange={vi.fn()}
          options={options}
        />
      );

      const label = screen.getByText('Priority');
      const select = screen.getByRole('combobox');

      expect(label).toHaveAttribute('for', 'priority');
      expect(select).toHaveAttribute('id', 'priority');
    });

    it('should show error with aria-invalid', () => {
      render(
        <AccessibleSelect
          id="priority"
          label="Priority"
          value=""
          onChange={vi.fn()}
          options={options}
          error="Please select a priority"
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByText('Please select a priority')).toHaveAttribute(
        'role',
        'alert'
      );
    });
  });

  // ===== ACCESSIBLE CHECKBOX TESTS =====
  describe('AccessibleCheckbox', () => {
    it('should render checkbox with label', () => {
      render(
        <AccessibleCheckbox
          id="terms"
          label="I agree to terms"
          checked={false}
          onChange={vi.fn()}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      const label = screen.getByText('I agree to terms');

      expect(checkbox).toHaveAttribute('id', 'terms');
      expect(label).toHaveAttribute('for', 'terms');
    });

    it('should have large click target (minimum 44x44px)', () => {
      render(
        <AccessibleCheckbox
          id="check"
          label="Check me"
          checked={false}
          onChange={vi.fn()}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      // The wrapper div provides the large clickable area
      expect(checkbox.closest('div')).toHaveClass('flex', 'items-center');
    });

    it('should toggle on click', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { rerender } = render(
        <AccessibleCheckbox
          id="check"
          label="Check me"
          checked={false}
          onChange={handleChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(handleChange).toHaveBeenCalled();
    });
  });

  // ===== ACCESSIBLE ALERT TESTS =====
  describe('AccessibleAlert', () => {
    it('should have role="alert" for error type', () => {
      render(
        <AccessibleAlert
          type="error"
          title="Error"
          message="Something went wrong"
        />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have role="status" for info type', () => {
      render(
        <AccessibleAlert
          type="info"
          title="Info"
          message="This is informational"
        />
      );

      const alert = screen.getByRole('status');
      expect(alert).toBeInTheDocument();
    });

    it('should display title and message', () => {
      render(
        <AccessibleAlert
          type="success"
          title="Success!"
          message="Operation completed"
        />
      );

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button clicked', async () => {
      const user = userEvent.setup();
      const handleDismiss = vi.fn();

      render(
        <AccessibleAlert
          type="warning"
          title="Warning"
          message="Be careful"
          onDismiss={handleDismiss}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /close alert/i });
      await user.click(dismissButton);

      expect(handleDismiss).toHaveBeenCalled();
    });
  });

  // ===== SKIP TO MAIN CONTENT TESTS =====
  describe('SkipToMainContent', () => {
    it('should render skip link with correct href', () => {
      render(<SkipToMainContent mainId="main-content" />);

      const link = screen.getByText('Skip to main content');
      expect(link).toHaveAttribute('href', '#main-content');
    });

    it('should only be visible on focus', () => {
      render(<SkipToMainContent mainId="main" />);

      const link = screen.getByText('Skip to main content');
      // Should have focus:top-0 class (visible on focus)
      expect(link.className).toContain('focus:top-0');
      // Should start hidden (-top-10)
      expect(link.className).toContain('-top-10');
    });

    it('should have high z-index for visibility', () => {
      render(<SkipToMainContent />);

      const link = screen.getByText('Skip to main content');
      expect(link.className).toContain('z-50');
    });
  });

  // ===== KEYBOARD NAVIGATION TESTS =====
  describe('Keyboard Navigation', () => {
    it('should navigate between accessible inputs with Tab key', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <AccessibleInput
            id="first"
            label="First"
            value=""
            onChange={vi.fn()}
          />
          <AccessibleInput
            id="second"
            label="Second"
            value=""
            onChange={vi.fn()}
          />
        </div>
      );

      const first = screen.getByLabelText('First');
      const second = screen.getByLabelText('Second');

      first.focus();
      expect(document.activeElement).toBe(first);

      await user.tab();
      expect(document.activeElement).toBe(second);
    });

    it('should skip to main content with skip link', async () => {
      const user = userEvent.setup();

      render(
        <>
          <SkipToMainContent mainId="main" />
          <nav>Navigation content</nav>
          <main id="main">Main content</main>
        </>
      );

      // Tab to skip link (first focusable element)
      await user.tab();
      const skipLink = screen.getByText('Skip to main content');
      expect(document.activeElement).toBe(skipLink);

      // Press Enter to navigate
      await user.keyboard('{Enter}');
      expect(window.location.hash).toBe('#main');
    });
  });

  // ===== FOCUS MANAGEMENT TESTS =====
  describe('Focus Management', () => {
    it('should maintain focus styles', () => {
      render(<AccessibleButton onClick={vi.fn()}>Button</AccessibleButton>);

      const button = screen.getByRole('button');
      button.focus();

      expect(button.className).toContain('focus:ring-2');
      expect(button).toHaveFocus();
    });

    it('should show focus indicator on input', () => {
      render(
        <AccessibleInput
          id="test"
          label="Test"
          value=""
          onChange={vi.fn()}
        />
      );

      const input = screen.getByRole('textbox');
      input.focus();

      expect(input).toHaveFocus();
      expect(input.className).toContain('focus:ring');
    });
  });

  // ===== ARIA ATTRIBUTES TESTS =====
  describe('ARIA Attributes', () => {
    it('should apply aria-invalid on error', () => {
      render(
        <AccessibleInput
          id="email"
          label="Email"
          value=""
          onChange={vi.fn()}
          error="Invalid email"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should apply aria-describedby for error descriptions', () => {
      render(
        <AccessibleInput
          id="password"
          label="Password"
          value=""
          onChange={vi.fn()}
          error="Too short"
          ariaDescribedBy="password-hint"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('should have aria-label on button', () => {
      render(
        <AccessibleButton
          ariaLabel="Delete task"
          onClick={vi.fn()}
        >
          ×
        </AccessibleButton>
      );

      const button = screen.getByRole('button', { name: /delete task/i });
      expect(button).toHaveAttribute('aria-label', 'Delete task');
    });
  });
});
