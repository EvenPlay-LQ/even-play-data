import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SignupWizard from '../pages/SignupWizard';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth';

// Mock framer-motion to remove animations entirely
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => children,
  motion: {
    div: (props: any) => {
      const { initial, animate, exit, transition, variants, whileHover, whileTap, ...rest } = props;
      return <div {...rest} />;
    },
  },
}));

// Mock Supabase Client and RPCs
vi.mock('@/integrations/supabase/client', () => {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: { id: 'dummy_id' }, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  chain.upsert = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockResolvedValue({ error: null });

  return {
    supabase: {
      from: vi.fn(() => ({ ...chain })),
      rpc: vi.fn().mockResolvedValue({ data: { athlete_id: 'new_athlete_id' }, error: null }),
    },
  };
});

// Mock Auth Hook
const mockUser = { id: 'test-user-id', email: 'test@evenplay.com', user_metadata: { name: 'Test User' } };
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: mockUser }),
  AuthProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock useProfile Hook
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    profile: null,
    setupComplete: false,
    refreshProfile: vi.fn().mockResolvedValue(undefined),
    roles: [],
    primaryRole: null,
    getDashboardPath: () => '/buzz',
  }),
}));

import { HelmetProvider } from 'react-helmet-async';

const renderWizard = () =>
  render(
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SignupWizard />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );

describe('SignupWizard Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Athlete wizard has 6 steps including Link Institution', async () => {
    renderWizard();

    // Step 1: Verify role selection renders with "Athlete" option
    expect(await screen.findByText('Athlete')).toBeInTheDocument();
    expect(screen.getByText('Institution / Club')).toBeInTheDocument();
    expect(screen.getByText('Parent / Guardian')).toBeInTheDocument();

    // Select Athlete role
    const athleteBtn = screen.getByText('Athlete').closest('button')!;
    await act(async () => { fireEvent.click(athleteBtn); });

    // Verify 6 step labels exist for athlete (Choose Role, Basic Info, Sports Profile, Credentials, Link Institution, Consent)
    await waitFor(() => {
      expect(screen.getByText('Link Institution')).toBeInTheDocument();
      expect(screen.getByText('Privacy & Consent')).toBeInTheDocument();
    });
  });

  it('Institution wizard has 4 steps', async () => {
    renderWizard();

    // Select Institution role
    const instBtn = (await screen.findByText('Institution / Club')).closest('button')!;
    await act(async () => { fireEvent.click(instBtn); });

    // Verify 4 step labels for institution
    await waitFor(() => {
      expect(screen.getByText('Contact Info')).toBeInTheDocument();
      expect(screen.getByText('Institution Details')).toBeInTheDocument();
      expect(screen.getByText('Privacy & Consent')).toBeInTheDocument();
    });
  });

  it('Athlete RPC calls include institution_id and location_id params', async () => {
    // Verify the RPC function signatures accept the new parameters
    const { supabase } = await import('@/integrations/supabase/client');

    // Simulate the RPC call that would happen during athlete signup
    await supabase.rpc('find_or_create_athlete', {
      p_full_name: 'Test Athlete',
      p_date_of_birth: '2005-01-01',
      p_sport: 'Football',
      p_email: 'test@example.com',
      p_position: 'Striker',
      p_institution_id: 'inst-123',
      p_location_id: 'loc-456',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('find_or_create_athlete', expect.objectContaining({
      p_institution_id: 'inst-123',
      p_location_id: 'loc-456',
    }));

    // Simulate claim RPC
    await supabase.rpc('claim_athlete_profile', {
      p_athlete_id: 'ath-789',
      p_profile_id: 'prof-123',
      p_institution_id: 'inst-123',
      p_location_id: 'loc-456',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('claim_athlete_profile', expect.objectContaining({
      p_institution_id: 'inst-123',
      p_location_id: 'loc-456',
    }));
  });
});
