import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TenantProvider, useTenant } from './useTenant';

// Simple consumer component for testing hook
function TestConsumer() {
  const tenant = useTenant();
  return (
    <div>
      <span data-testid="tenant-id">{tenant.id}</span>
      <span data-testid="tenant-name">{tenant.name}</span>
    </div>
  );
}

describe('useTenant Hook & Provider', () => {
  it('should provide the active tenant context to children', () => {
    render(
      <TenantProvider>
        <TestConsumer />
      </TenantProvider>
    );

    // Default VITE_TENANT_ID fallback is "zupco"
    expect(screen.getByTestId('tenant-id').textContent).toBe('zupco');
    expect(screen.getByTestId('tenant-name').textContent).toBe('ZUPCO Express');
  });
});
