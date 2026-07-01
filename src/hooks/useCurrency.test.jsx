import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CurrencyProvider, useCurrency } from './useCurrency';

function CurrencyConsumer() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div>
      <span data-testid="currency-id">{currency.id}</span>
      <span data-testid="currency-symbol">{currency.symbol}</span>
      <button onClick={() => setCurrency('ZAR')} data-testid="change-btn">
        Change to ZAR
      </button>
    </div>
  );
}

describe('useCurrency Hook & Provider', () => {
  it('should throw an error when used outside CurrencyProvider', () => {
    // Suppress console.error during the expected throwing test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<CurrencyConsumer />)).toThrow(
      'useCurrency must be used within a CurrencyProvider'
    );
    
    spy.mockRestore();
  });

  it('should initialize with default USD currency', () => {
    render(
      <CurrencyProvider>
        <CurrencyConsumer />
      </CurrencyProvider>
    );

    expect(screen.getByTestId('currency-id').textContent).toBe('USD');
    expect(screen.getByTestId('currency-symbol').textContent).toBe('$');
  });

  it('should allow changing the currency', () => {
    render(
      <CurrencyProvider>
        <CurrencyConsumer />
      </CurrencyProvider>
    );

    expect(screen.getByTestId('currency-id').textContent).toBe('USD');

    const button = screen.getByTestId('change-btn');
    act(() => {
      button.click();
    });

    expect(screen.getByTestId('currency-id').textContent).toBe('ZAR');
    expect(screen.getByTestId('currency-symbol').textContent).toBe('R');
  });
});
