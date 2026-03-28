import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthPanel } from '../AuthPanel';

describe('AuthPanel Component', () => {
  const mockOnLogin = vi.fn();
  const mockOnLogout = vi.fn();
  const mockOnSettings = vi.fn();

  it('should render login button when no user', () => {
    render(
      <AuthPanel
        user={null}
        loading={false}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Login with Google')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('should render logout button when user is authenticated', () => {
    const user = { id: 1, username: 'testuser' };

    render(
      <AuthPanel
        user={user}
        loading={false}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.getByText('Logged in as: testuser')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login with Google')).not.toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <AuthPanel
        user={null}
        loading={true}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
      />
    );

    expect(
      screen.getByText('Checking authentication...')
    ).toBeInTheDocument();
  });

  it('should call onLogin when login button clicked', async () => {
    const user = userEvent.setup();

    render(
      <AuthPanel
        user={null}
        loading={false}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
      />
    );

    const loginButton = screen.getByText('Login with Google');
    await user.click(loginButton);

    expect(mockOnLogin).toHaveBeenCalledOnce();
  });

  it('should call onLogout when logout button clicked', async () => {
    const user = userEvent.setup();
    const authUser = { id: 1, username: 'testuser' };

    render(
      <AuthPanel
        user={authUser}
        loading={false}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
      />
    );

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalledOnce();
  });

  it('should render settings button when user is authenticated and onSettings provided', () => {
    const authUser = { id: 1, username: 'testuser' };

    render(
      <AuthPanel
        user={authUser}
        loading={false}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onSettings={mockOnSettings}
      />
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should not render settings button when onSettings not provided', () => {
    const authUser = { id: 1, username: 'testuser' };

    render(
      <AuthPanel
        user={authUser}
        loading={false}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
      />
    );

    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('should call onSettings when settings button clicked', async () => {
    const user = userEvent.setup();
    const authUser = { id: 1, username: 'testuser' };

    render(
      <AuthPanel
        user={authUser}
        loading={false}
        onLogin={mockOnLogin}
        onLogout={mockOnLogout}
        onSettings={mockOnSettings}
      />
    );

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    expect(mockOnSettings).toHaveBeenCalledOnce();
  });
});
