import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsLayout from '../../../src/ui/templates/SettingsLayout';

vi.mock('../../../src/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { email: 'test@test.com' }, signOut: vi.fn() }),
}));

describe('SettingsLayout', () => {
  it('renders "Mis Calderos" tab', () => {
    render(
      <MemoryRouter>
        <SettingsLayout activeTab="store" onTabChange={vi.fn()}>
          <div>Content</div>
        </SettingsLayout>
      </MemoryRouter>,
    );
    expect(screen.getByText('Mis Calderos')).toBeInTheDocument();
  });

  it('calls onTabChange when Calderos tab is clicked', () => {
    const handleChange = vi.fn();
    render(
      <MemoryRouter>
        <SettingsLayout activeTab="store" onTabChange={handleChange}>
          <div>Content</div>
        </SettingsLayout>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Mis Calderos'));
    expect(handleChange).toHaveBeenCalledWith('calderos');
  });
});
