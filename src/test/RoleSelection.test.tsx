import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import RoleSelection from '../pages/RoleSelection.tsx';

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
  });

  it('switches the main screen copy to Hindi from the language selector', async () => {
    const user = userEvent.setup();

    render(<RoleSelection />);

    await user.selectOptions(screen.getByLabelText('Language'), 'hi');

    expect(screen.getByText('Command Centre')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'डेमो डेटा लोड करें' })).toBeInTheDocument();
    expect(window.localStorage.getItem('restaurant-pwa-language')).toBe('hi');
  });
});
