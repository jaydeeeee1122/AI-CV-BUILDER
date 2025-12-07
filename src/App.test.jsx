import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders the landing page by default (unauthenticated)', () => {
        render(<App />);
        // Check for key elements from Landing Page
        expect(screen.getByText(/Build a Professional CV/i)).toBeInTheDocument();
        expect(screen.getByText(/Get Started Free/i)).toBeInTheDocument();
    });
});
