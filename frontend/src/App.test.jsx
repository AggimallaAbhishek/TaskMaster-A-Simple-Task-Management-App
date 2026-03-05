import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

describe('TaskMaster Frontend', () => {
    beforeEach(() => {
        fetch.mockClear();
    });

    it('renders task management app', () => {
        render(<App />);
        expect(screen.getByText('TaskMaster 🚀')).toBeInTheDocument();
    });

    it('displays loading state', () => {
        render(<App />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
