import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LogoBox from './LogoBox';
import * as useTenantModule from '../tenants/useTenant';

vi.mock('../tenants/useTenant', () => ({
  useTenant: vi.fn(),
}));

describe('LogoBox Component', () => {
  it('should render the first letter of tenant name and apply styling', () => {
    vi.mocked(useTenantModule.useTenant).mockReturnValue({
      name: 'Swift Coaches',
      primaryColor: '#2563eb',
      logoType: 'circle',
    });

    const { container } = render(<LogoBox size={60} />);
    expect(screen.getByText('S')).toBeInTheDocument();
    const div = container.firstChild;
    expect(div.style.borderRadius).toBe('50%');
    expect(div.style.width).toBe('60px');
  });

  it('should apply pill border radius if logoType is pill', () => {
    vi.mocked(useTenantModule.useTenant).mockReturnValue({
      name: 'Horizon Transit',
      primaryColor: '#7c3aed',
      logoType: 'pill',
    });

    const { container } = render(<LogoBox size={80} />);
    const div = container.firstChild;
    expect(div.style.borderRadius).toBe('40px'); // 80 / 2
  });

  it('should apply default 12px border radius for square/other logo shapes', () => {
    vi.mocked(useTenantModule.useTenant).mockReturnValue({
      name: 'Zupco',
      primaryColor: '#16a34a',
      logoType: 'square',
    });

    const { container } = render(<LogoBox size={50} />);
    const div = container.firstChild;
    expect(div.style.borderRadius).toBe('12px');
  });
});
