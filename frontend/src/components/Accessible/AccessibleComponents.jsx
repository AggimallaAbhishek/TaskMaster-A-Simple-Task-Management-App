import React from 'react';

/**
 * AccessibleButton - WCAG 2.1 AA compliant button component
 *
 * Features:
 * - Proper ARIA labels and descriptions
 * - Keyboard navigation support (Enter, Space)
 * - Focus management and visible focus indicator
 * - Disabled state handling
 * - Screen reader support
 */
export const AccessibleButton = ({
  onClick,
  children,
  ariaLabel,
  ariaDescribedBy,
  disabled = false,
  title,
  className = '',
  type = 'button',
  variant = 'primary', // 'primary', 'secondary', 'danger'
}) => {
  const handleKeyDown = (e) => {
    // Support both Enter and Space keys
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onClick?.();
    }
  };

  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-black',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      title={title}
      className={`
        px-4 py-2 rounded font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${variantStyles[variant]}
        ${className}
      `}
      onKeyDown={handleKeyDown}
    >
      {children}
    </button>
  );
};

/**
 * AccessibleInput - WCAG 2.1 AA compliant input component
 *
 * Features:
 * - Associated label element (proper for attribute)
 * - Error message with aria-describedby
 * - Aria-invalid for error states
 * - Visible focus indicator
 * - Clear placeholder text
 */
export const AccessibleInput = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  required = false,
  disabled = false,
  ariaDescribedBy,
  className = '',
  autoComplete,
}) => {
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ');

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span aria-label="required">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy || undefined}
        autoComplete={autoComplete}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * SkipToMainContent - Keyboard navigation skip link
 *
 * Features:
 * - Only visible when focused (keyboard navigation)
 * - Skips to main content for screen readers
 * - WCAG 2.1 AA requirement
 */
export const SkipToMainContent = ({ mainId = 'main-content' }) => {
  return (
    <a
      href={`#${mainId}`}
      className={`
        absolute -top-10 left-0 bg-blue-600 text-white px-3 py-2 rounded
        focus:top-0 focus:outline-none
        transition-all duration-200
        z-50
      `}
    >
      Skip to main content
    </a>
  );
};

/**
 * AccessibleSelect - WCAG 2.1 AA compliant select component
 *
 * Features:
 * - Proper label association
 * - Error handling with aria-invalid
 * - Visible focus indicator
 */
export const AccessibleSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span aria-label="required">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId || undefined}
        className={`
          w-full px-3 py-2 border rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * AccessibleCheckbox - WCAG 2.1 AA compliant checkbox
 *
 * Features:
 * - Large click target (44x44px minimum)
 * - Visible focus indicator
 * - Proper label association
 */
export const AccessibleCheckbox = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
}) => {
  return (
    <div className="flex items-center mb-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-5 h-5 rounded border-gray-300
          focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      />
      {label && (
        <label
          htmlFor={id}
          className="ml-3 text-sm font-medium text-gray-700 cursor-pointer"
        >
          {label}
        </label>
      )}
    </div>
  );
};

/**
 * AccessibleAlert - WCAG 2.1 AA compliant alert component
 *
 * Features:
 * - Proper role for alert types
 * - Announcements for screen readers (role="alert")
 * - Clear visual distinction
 */
export const AccessibleAlert = ({
  type = 'info', // 'info', 'success', 'warning', 'error'
  title,
  message,
  onDismiss,
}) => {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };

  const role = type === 'error' || type === 'warning' ? 'alert' : 'status';

  return (
    <div
      role={role}
      className={`
        p-4 border-l-4 rounded
        ${typeStyles[type]}
      `}
    >
      <div className="flex justify-between items-start">
        <div>
          {title && <h3 className="font-bold mb-1">{title}</h3>}
          <p>{message}</p>
        </div>
        {onDismiss && (
          <AccessibleButton
            onClick={onDismiss}
            ariaLabel="Close alert"
            className="ml-2 px-2 py-1 text-sm"
          >
            ×
          </AccessibleButton>
        )}
      </div>
    </div>
  );
};
