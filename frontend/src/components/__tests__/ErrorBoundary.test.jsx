import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Component that throws an error
function BrokenComponent() {
  throw new Error('Test error');
}

// Component that doesn't throw
function WorkingComponent() {
  return <div>I work!</div>;
}

describe('ErrorBoundary Component', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('I work!')).toBeInTheDocument();
  });

  it('should catch errors and display error message', () => {
    // Suppress console.error for this test
    const consoleSpy = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong 😞')).toBeInTheDocument();
    expect(screen.getByText(/Test error/)).toBeInTheDocument();

    console.error = consoleSpy;
  });

  it('should display error details in collapsible section', () => {
    const consoleSpy = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error details')).toBeInTheDocument();

    console.error = consoleSpy;
  });

  it('should provide Try Again button', () => {
    const consoleSpy = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Try Again')).toBeInTheDocument();

    console.error = consoleSpy;
  });
});
