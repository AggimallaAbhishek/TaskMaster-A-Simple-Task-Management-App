import React from 'react';
import { AccessibleButton } from '../Accessible';
import { COLORS } from '../../styles/theme';

/**
 * DateRangePicker - Component for selecting date ranges
 *
 * Features:
 * - Start date input
 * - End date input
 * - Clear button
 * - Accessible date inputs
 */
export const DateRangePicker = ({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClear,
}) => {
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
        Due Date Range
      </label>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '12px',
        }}
      >
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label
            htmlFor="date-from"
            style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            From
          </label>
          <input
            id="date-from"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${COLORS.BORDER}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            aria-label="Start date for date range filter"
          />
        </div>

        <div style={{ flex: '1', minWidth: '150px' }}>
          <label
            htmlFor="date-to"
            style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '12px',
              fontWeight: '500',
            }}
          >
            To
          </label>
          <input
            id="date-to"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${COLORS.BORDER}`,
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            aria-label="End date for date range filter"
          />
        </div>

        {(startDate || endDate) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <AccessibleButton
              type="button"
              onClick={onClear}
              variant="secondary"
              ariaLabel="Clear date range"
              style={{ fontSize: '12px', padding: '8px 12px' }}
            >
              Clear
            </AccessibleButton>
          </div>
        )}
      </div>
    </div>
  );
};
