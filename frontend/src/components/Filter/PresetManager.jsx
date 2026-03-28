import React, { useState } from 'react';
import { AccessibleButton } from '../Accessible';
import { AccessibleInput } from '../Accessible';
import { AccessibleAlert } from '../Accessible';
import { COLORS } from '../../styles/theme';

/**
 * PresetManager - Component for managing filter presets
 *
 * Features:
 * - Save current filter as preset
 * - Load preset
 * - Delete preset
 * - Input for preset name
 * - Error/success messages
 */
export const PresetManager = ({
  presets,
  loading,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  currentFilters,
}) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      setError('Preset name is required');
      return;
    }

    try {
      await onSavePreset(presetName, presetDescription, currentFilters);
      setSuccess(true);
      setPresetName('');
      setPresetDescription('');
      setShowSaveForm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save preset');
    }
  };

  const handleDeletePreset = async (presetId) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      try {
        await onDeletePreset(presetId);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } catch (err) {
        setError(err.message || 'Failed to delete preset');
      }
    }
  };

  return (
    <div
      style={{
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        border: `1px solid ${COLORS.BORDER}`,
      }}
    >
      <label
        style={{
          display: 'block',
          marginBottom: '12px',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        Filter Presets
      </label>

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
          message="Preset saved successfully"
          onDismiss={() => setSuccess(false)}
        />
      )}

      <div style={{ marginBottom: '12px' }}>
        {!showSaveForm ? (
          <AccessibleButton
            type="button"
            onClick={() => setShowSaveForm(true)}
            variant="secondary"
            ariaLabel="Save current filter as preset"
            style={{ fontSize: '14px' }}
          >
            Save As Preset
          </AccessibleButton>
        ) : (
          <div style={{ marginBottom: '12px' }}>
            <AccessibleInput
              id="preset-name"
              label="Preset Name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g., My Important Tasks"
              required
            />

            <div style={{ marginTop: '8px', marginBottom: '12px' }}>
              <label
                htmlFor="preset-description"
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                Description (optional)
              </label>
              <textarea
                id="preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Describe this preset..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${COLORS.BORDER}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  minHeight: '50px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <AccessibleButton
                type="button"
                onClick={handleSavePreset}
                disabled={loading}
                ariaLabel="Save preset"
                style={{ fontSize: '14px' }}
              >
                {loading ? 'Saving...' : 'Save'}
              </AccessibleButton>

              <AccessibleButton
                type="button"
                onClick={() => {
                  setShowSaveForm(false);
                  setError(null);
                }}
                variant="secondary"
                ariaLabel="Cancel save preset"
                style={{ fontSize: '14px' }}
              >
                Cancel
              </AccessibleButton>
            </div>
          </div>
        )}
      </div>

      {presets.length > 0 && (
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            Saved Presets:
          </label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {presets.map((preset) => (
              <div
                key={preset.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: `1px solid ${COLORS.BORDER}`,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: '500',
                      fontSize: '14px',
                      marginBottom: '4px',
                    }}
                  >
                    {preset.name}
                  </div>
                  {preset.description && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: COLORS.TEXT_MUTED,
                      }}
                    >
                      {preset.description}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <AccessibleButton
                    type="button"
                    onClick={() => onLoadPreset(preset.id)}
                    disabled={loading}
                    variant="secondary"
                    ariaLabel={`Load preset: ${preset.name}`}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  >
                    Load
                  </AccessibleButton>

                  <AccessibleButton
                    type="button"
                    onClick={() => handleDeletePreset(preset.id)}
                    disabled={loading}
                    variant="secondary"
                    ariaLabel={`Delete preset: ${preset.name}`}
                    style={{
                      fontSize: '12px',
                      padding: '6px 10px',
                      backgroundColor: COLORS.DANGER,
                    }}
                  >
                    Delete
                  </AccessibleButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
