import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileForm } from '../ProfileForm';
import { ProfilePanel } from '../ProfilePanel';

describe('Profile Components', () => {
  // ===== PROFILE FORM TESTS =====
  describe('ProfileForm', () => {
    const mockProfile = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      bio: 'Test bio',
      theme: 'light',
      notifications_enabled: true,
    };

    it('should render form with profile data', () => {
      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
      const themeSelect = screen.getByRole('combobox', { name: /theme/i });
      expect(themeSelect).toHaveValue('light');
    });

    it('should populate form fields from profile', () => {
      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />
      );

      const bioTextarea = screen.getByPlaceholderText('Tell us about yourself');
      expect(bioTextarea.value).toBe('Test bio');
    });

    it('should call onSubmit with form data', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={handleSubmit}
          onCancel={vi.fn()}
        />
      );

      const submitButton = screen.getByRole('button', {
        name: /save profile changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            bio: 'Test bio',
            theme: 'light',
            notifications_enabled: true,
          })
        );
      });
    });

    it('should update bio field', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={handleSubmit}
          onCancel={vi.fn()}
        />
      );

      const bioTextarea = screen.getByPlaceholderText('Tell us about yourself');
      await user.clear(bioTextarea);
      await user.type(bioTextarea, 'New bio');

      const submitButton = screen.getByRole('button', {
        name: /save profile changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            bio: 'New bio',
          })
        );
      });
    });

    it('should toggle notifications checkbox', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={handleSubmit}
          onCancel={vi.fn()}
        />
      );

      const checkbox = screen.getByRole('checkbox', {
        name: /enable notifications/i,
      });
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      const submitButton = screen.getByRole('button', {
        name: /save profile changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notifications_enabled: false,
          })
        );
      });
    });

    it('should change theme selection', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={handleSubmit}
          onCancel={vi.fn()}
        />
      );

      const themeSelect = screen.getByRole('combobox', { name: /theme/i });
      await user.selectOptions(themeSelect, 'dark');

      const submitButton = screen.getByRole('button', {
        name: /save profile changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: 'dark',
          })
        );
      });
    });

    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();
      const handleCancel = vi.fn();

      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={vi.fn()}
          onCancel={handleCancel}
        />
      );

      const cancelButton = screen.getByRole('button', {
        name: /cancel profile editing/i,
      });
      await user.click(cancelButton);

      expect(handleCancel).toHaveBeenCalledOnce();
    });

    it('should display error alert on submission error', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn().mockRejectedValueOnce(
        new Error('Update failed')
      );

      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={handleSubmit}
          onCancel={vi.fn()}
        />
      );

      const submitButton = screen.getByRole('button', {
        name: /save profile changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });

    it('should show success message on successful submission', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn();

      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={handleSubmit}
          onCancel={vi.fn()}
        />
      );

      const submitButton = screen.getByRole('button', {
        name: /save profile changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
      });
    });

    it('should disable form during submission', async () => {
      render(
        <ProfileForm
          profile={mockProfile}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          loading={true}
        />
      );

      const bioTextarea = screen.getByPlaceholderText('Tell us about yourself');
      expect(bioTextarea).toBeDisabled();

      // When loading, button shows "Saving..." text
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find((btn) => btn.textContent.includes('Saving'));
      expect(submitButton).toBeDisabled();
    });
  });

  // ===== PROFILE PANEL TESTS =====
  describe('ProfilePanel', () => {
    const mockProfile = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      bio: 'Test bio',
      theme: 'dark',
      notifications_enabled: false,
      avatar_path: '/avatars/user.jpg',
    };

    it('should display profile information', () => {
      render(
        <ProfilePanel
          profile={mockProfile}
          onFetch={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test bio')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(
        <ProfilePanel
          profile={null}
          loading={true}
          onFetch={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    it('should toggle edit mode on button click', async () => {
      const user = userEvent.setup();

      render(
        <ProfilePanel
          profile={mockProfile}
          onFetch={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      // Should show form after editing
      expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
    });

    it('should display notification status', () => {
      render(
        <ProfilePanel
          profile={mockProfile}
          onFetch={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      expect(screen.getByText('Disabled')).toBeInTheDocument(); // Notifications disabled
    });

    it('should display avatar if present', () => {
      render(
        <ProfilePanel
          profile={mockProfile}
          onFetch={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      const avatar = screen.getByAltText('User avatar');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', '/avatars/user.jpg');
    });

    it('should call onFetch on mount', () => {
      const handleFetch = vi.fn();

      render(
        <ProfilePanel
          profile={null}
          loading={false}
          onFetch={handleFetch}
          onUpdate={vi.fn()}
        />
      );

      expect(handleFetch).toHaveBeenCalled();
    });

    it('should exit edit mode after successful update', async () => {
      const user = userEvent.setup();
      const handleUpdate = vi.fn();

      const { rerender } = render(
        <ProfilePanel
          profile={mockProfile}
          onFetch={vi.fn()}
          onUpdate={handleUpdate}
        />
      );

      // Click edit
      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await user.click(editButton);

      // Form should be visible
      expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /save profile changes/i,
      });
      await user.click(submitButton);

      // After successful update, should return to display mode
      await waitFor(() => {
        expect(handleUpdate).toHaveBeenCalled();
      });

      // Re-render and verify display mode
      rerender(
        <ProfilePanel
          profile={mockProfile}
          onFetch={vi.fn()}
          onUpdate={handleUpdate}
        />
      );

      // Should be back in display mode
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should handle missing optional fields', () => {
      const minimalProfile = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        theme: 'light',
        notifications_enabled: true,
      };

      render(
        <ProfilePanel
          profile={minimalProfile}
          onFetch={vi.fn()}
          onUpdate={vi.fn()}
        />
      );

      // Should not crash and display username and email
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });
});
