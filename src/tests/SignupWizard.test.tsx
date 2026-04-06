import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupWizard from '../pages/SignupWizard';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';

// Mock Supabase Client and RPCs
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table) => ({
      upsert: vi.fn().mockResolvedValue({ data: { id: 'dummy_id' }, error: null }),
      insert: vi.fn().mockResolvedValue({ data: { id: 'dummy_id' }, error: null }),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'parent_id' }, error: null }),
      update: vi.fn().mockResolvedValue({ error: null })
    })),
    rpc: vi.fn().mockResolvedValue({ data: { athlete_id: 'new_athlete_id' }, error: null })
  }
}));

// Mock Auth Hook
const mockUser = { id: 'test-user-id', email: 'test@evenplay.com', user_metadata: { name: 'Test User' } };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

import { HelmetProvider } from 'react-helmet-async';

const renderWizard = () => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SignupWizard />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('SignupWizard Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Athlete Flow: Proceeds through 5 steps and invokes find_or_create_athlete', async () => {
    renderWizard();
    
    // Step 1: Select Athlete
    const athleteRoleBtn = await screen.findByText('Athlete');
    fireEvent.click(athleteRoleBtn);
    fireEvent.click(screen.getByText('Next'));
    
    // Step 2: Basic Info
    await screen.findByText('Basic Info');
    fireEvent.change(document.querySelector('input[type="date"]'), { target: { value: '2005-01-01' } });
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Sports Profile
    await screen.findByText('Sports Profile');
    fireEvent.change(screen.getByPlaceholderText('e.g. Striker'), { target: { value: 'Striker' } });
    fireEvent.click(screen.getByText('Next'));

    // Step 4: Credentials
    await screen.findByText('Your Credentials');
    fireEvent.click(screen.getByText('Next'));

    // Step 5: Consent & Submit
    await screen.findByText('Privacy & Consent');
    const checkbox = document.querySelector('button[role="checkbox"]');
    if (checkbox) fireEvent.click(checkbox);
    
    const completeBtn = screen.getByText('Complete Setup');
    // We expect the button to be clickable once consented.
    expect(completeBtn).not.toBeDisabled();
    
    fireEvent.click(completeBtn);
    
    // Verify Supabase RPC was called to link Athlete
    const { supabase } = await import('@/integrations/supabase/client');
    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('find_or_create_athlete', expect.any(Object));
      // Verify profiles table upsert
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  it('Institution Flow: Validates required inputs before proceeding', async () => {
    renderWizard();
    
    // Step 1: Select Institution
    const instRoleBtn = await screen.findByText('Institution / Club');
    fireEvent.click(instRoleBtn);
    fireEvent.click(screen.getByText('Next'));
    
    // Step 2: Contact Info
    await screen.findByText('Contact Info');
    fireEvent.click(screen.getByText('Next'));

    // Step 3: Institution Details
    await screen.findByText('Institution Details');
    
    // Expected to not proceed if Province/Name empty:
    const nextBtn = screen.getByText('Next');
    expect(nextBtn).toBeDisabled();
    
    fireEvent.change(screen.getByPlaceholderText('e.g. Premier FC Academy'), { target: { value: 'Local Academy' } });
    fireEvent.change(screen.getByPlaceholderText('e.g. Gauteng'), { target: { value: 'Gauteng' } });
    
    expect(nextBtn).not.toBeDisabled();
  });
});
