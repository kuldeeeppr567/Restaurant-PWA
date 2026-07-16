import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, vi } from 'vitest';
import RoleSelection from '../pages/RoleSelection.tsx';
import { loadDemoData } from '../db/seedData.ts';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../db/seedData.ts', () => ({
  loadDemoData: vi.fn(),
  resetDemoData: vi.fn(),
}));

vi.mock('../hooks/useOnlineStatus.ts', () => ({
  useOnlineStatus: () => true,
}));

describe('RoleSelection', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => undefined);
  });

  it('switches UI copy to Hindi from the language selector', async () => {
    const user = userEvent.setup();

    render(<RoleSelection />);

    await user.selectOptions(screen.getByLabelText('Language'), 'hi');

    expect(screen.getByRole('heading', { name: 'ऑर्डर मैनेजमेंट ऐप' })).toBeInTheDocument();
    expect(screen.getByText('कमांड सेंटर')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'डेमो डेटा लोड करें' })).toBeInTheDocument();
    expect(window.localStorage.getItem('restaurant-pwa-language')).toBe('hi');
  });

  it('loads demo data in the selected language', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<RoleSelection />);
    await user.selectOptions(screen.getByLabelText('Language'), 'hi');
    await user.click(screen.getByRole('button', { name: 'डेमो डेटा लोड करें' }));

    expect(loadDemoData).toHaveBeenCalledWith('hi');
  });
});
