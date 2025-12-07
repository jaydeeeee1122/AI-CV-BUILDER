import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreditDisplay } from './CreditDisplay';
import { supabase } from '../lib/supabase';
import { buyCredits } from '../services/stripeService';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('../lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { balance: 5 }, error: null })
                }))
            }))
        })),
        channel: vi.fn(() => ({
            on: vi.fn(() => ({
                subscribe: vi.fn()
            }))
        })),
        removeChannel: vi.fn()
    }
}));

vi.mock('../services/stripeService', () => ({
    buyCredits: vi.fn()
}));

describe('CreditDisplay', () => {
    const mockUserId = 'user-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders credit balance and handles buy click', async () => {
        render(<CreditDisplay userId={mockUserId} />);

        // Wait for loading to finish and credits to display
        await waitFor(() => {
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        // Check that animate-pulse is NOT present
        const container = screen.getByTitle("Low balance! Purchase more.");
        expect(container).toBeInTheDocument();
        // Use className check
        expect(container.className).not.toContain('animate-pulse');

        // Find and click the add button
        const addButton = screen.getByText('+');
        fireEvent.click(addButton);

        // Verify buyCredits was called
        expect(buyCredits).toHaveBeenCalledTimes(1);
    });
});
