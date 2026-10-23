import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

describe('Frontend Integration Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = 'dark';
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('/api/health')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                status: 'healthy',
                isGeminiConfigured: false,
                model: 'gemini-3.8-flash',
              }),
          });
        }
        return Promise.reject(new Error('Unknown url'));
      })
    );
  });

  it('renders application header, title, and tagline', async () => {
    render(<App />);

    expect(screen.getAllByText('WattWise AI').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Detect Waste. Decide Smartly. Save Energy.')).toBeInTheDocument();
  });

  it('renders sidebar navigation tabs with accessible tab roles', async () => {
    render(<App />);

    expect(screen.getByRole('tab', { name: /overview dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /data import & csv/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /analytics & findings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ai optimization agent/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^action center/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /savings calculator/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /settings & preferences/i })).toBeInTheDocument();
  });

  it('allows switching tabs via sidebar', async () => {
    render(<App />);

    // Click on Savings Calculator tab
    const calcTab = screen.getByRole('tab', { name: /savings calculator/i });
    fireEvent.click(calcTab);

    await waitFor(() => {
      expect(screen.getByText('Campus Savings Scenario Calculator')).toBeInTheDocument();
    }, { timeout: 4000 });

    // Click on Action Center tab
    const actionCenterTab = screen.getByRole('tab', { name: /action center/i });
    fireEvent.click(actionCenterTab);

    await waitFor(() => {
      expect(screen.getByText('Human-in-the-Loop Governance Guarantee')).toBeInTheDocument();
    }, { timeout: 4000 });

    // Click on Settings tab
    const settingsTab = screen.getByRole('tab', { name: /settings & preferences/i });
    fireEvent.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByText('Appearance & Theme')).toBeInTheDocument();
    }, { timeout: 4000 });
  });



  it('switches languages smoothly without crashing', async () => {
    render(<App />);

    // Open language menu in header
    const langBtn = screen.getByRole('button', { name: /change language/i });
    fireEvent.click(langBtn);

    // Click Hindi option
    const hindiOption = screen.getByText('हिन्दी');
    fireEvent.click(hindiOption);

    // Verify Hindi text rendered in the header/tagline
    await waitFor(() => {
      expect(screen.getByText('अपव्यय पहचानें। समझदारी से निर्णय लें। ऊर्जा बचाएं।')).toBeInTheDocument();
    });
  });

  it('toggles theme controls without error', () => {
    render(<App />);

    const themeToggleBtn = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeToggleBtn).toBeInTheDocument();

    fireEvent.click(themeToggleBtn);
    expect(themeToggleBtn).toBeInTheDocument();
  });

  it('renders WCAG 2.4.1 Skip to Content link pointing to #main-content', () => {
    render(<App />);

    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('provides an aria-live region for dynamic screen reader status announcements', () => {
    render(<App />);

    const announcer = document.getElementById('a11y-announcer');
    expect(announcer).toBeInTheDocument();
    expect(announcer).toHaveAttribute('aria-live', 'polite');
    expect(announcer).toHaveAttribute('role', 'status');
  });

  it('establishes proper W3C ARIA tablist and tabpanel relationships', () => {
    render(<App />);

    const tablist = screen.getByRole('tablist', { name: /campus navigation sections/i });
    expect(tablist).toBeInTheDocument();

    const mainPanel = screen.getByRole('tabpanel');
    expect(mainPanel).toBeInTheDocument();
    expect(mainPanel).toHaveAttribute('id', 'main-content');
  });
});

