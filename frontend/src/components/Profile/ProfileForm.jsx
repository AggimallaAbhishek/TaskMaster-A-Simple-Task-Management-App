import React, { useState, useEffect } from 'react';
import {
  AccessibleButton,
  AccessibleInput,
  AccessibleSelect,
  AccessibleCheckbox,
  AccessibleAlert,
} from '../Accessible';

/**
 * ProfileForm - Form for editing user profile
 *
 * Features:
 * - Edit bio (text area)
 * - Select theme (light/dark)
 * - Toggle notifications
 * - Submit and cancel actions
 * - Error handling with accessible alerts
 * - Loading state during submission
 */
export const ProfileForm = ({
  profile,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState('light');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setTheme(profile.theme || 'light');
      setNotificationsEnabled(profile.notifications_enabled !== false);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await onSubmit({
        bio,
        theme,
        notifications_enabled: notificationsEnabled,
      });
      setSuccess(true);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h3 style={{ marginBottom: '16px' }}>Edit Profile</h3>

      {error && (
        <AccessibleAlert
          type="error"
          title="Error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {success && (
        <AccessibleAlert
          type="success"
          title="Success"
          message="Profile updated successfully"
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="bio"
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
          }}
        >
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself"
          disabled={loading}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontFamily: 'Arial',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      </div>

      <AccessibleSelect
        id="theme"
        label="Theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        options={themeOptions}
        disabled={loading}
      />

      <AccessibleCheckbox
        id="notifications"
        label="Enable notifications"
        checked={notificationsEnabled}
        onChange={(e) => setNotificationsEnabled(e.target.checked)}
        disabled={loading}
      />

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <AccessibleButton
          type="submit"
          disabled={loading}
          ariaLabel="Save profile changes"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </AccessibleButton>

        <AccessibleButton
          type="button"
          onClick={onCancel}
          disabled={loading}
          variant="secondary"
          ariaLabel="Cancel profile editing"
        >
          Cancel
        </AccessibleButton>
      </div>
    </form>
  );
};
