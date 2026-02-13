import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import Layout from '../Layout.tsx';

// mock the entire api module
vi.mock('../../lib/api', () => ({
  getBuildInfo: vi.fn(),
}));

// mock RouteTracker to not depend on router internals
vi.mock('../../lib/routetracker.ts', () => ({
  default: () => null,
}));

import { getBuildInfo } from '../../lib/api.ts';

describe('Layout build info', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders children', () => {
    render(() => (
      <Layout>
        <div>Inner content</div>
      </Layout>
    ));

    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it('displays build info when fetch succeeds', async () => {
    (getBuildInfo as vi.Mock).mockResolvedValue({
      gitCommit: 'abc1234567890',
      compareUrl: 'github.com/org/repo/compare',
      gitTag: '',
    });

    render(() => (
      <Layout>
        <div data-testid="child">Content</div>
      </Layout>
    ));

    // Wait for loading to disappear and dropdown content to appear
    const button = await screen.findByRole('button', { name: /Build Info/i });

    // Click to open dropdown
    button.click();

    // Use flexible matcher for split text (Commit: + span)
    expect(screen.getByText('Commit:')).toBeInTheDocument();
    expect(screen.getByText('abc1234')).toBeInTheDocument();

    const compareUrl = await screen.findByRole('link', { name: /Commit:/i });
    expect(compareUrl).toHaveAttribute('href', 'github.com/org/repo/compare');
  });

  it('shows release tag when build is a release', async () => {
    (getBuildInfo as vi.Mock).mockResolvedValue({
      gitCommit: 'abc1234567890',
      compareUrl: 'github.com/org/repo/compare',
      gitTag: 'v1.2.3',
    });

    render(() => (
      <Layout>
        <div>Content</div>
      </Layout>
    ));

    const button = await screen.findByRole('button', { name: /Build Info/i });
    button.click();

    expect(screen.getByText('Release:')).toBeInTheDocument();
    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
  });

  it('closes build info dropdown on outside click', async () => {
    (getBuildInfo as vi.Mock).mockResolvedValue({
      gitCommit: 'abc1234567890',
      compareUrl: 'github.com/org/repo/compare',
      gitTag: '',
    });

    const { container } = render(() => (
      <Layout>
        <div data-testid="outside">Outside</div>
      </Layout>
    ));

    const button = await screen.findByRole('button', { name: /Build Info/i });

    // Open dropdown
    button.click();

    const dropdown = container.querySelector('.ring-1')!;
    expect(dropdown.classList.contains('hidden')).toBe(false);

    // Wait for the document click handler to be registered
    await new Promise((r) => setTimeout(r, 0));

    // Dispatch a real document click
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(dropdown.classList.contains('hidden')).toBe(true);
  });

  it('shows loading state initially', async () => {
    (getBuildInfo as vi.Mock).mockImplementationOnce(() => new Promise(() => {})); // never resolves
    render(() => (
      <Layout>
        <div>Content</div>
      </Layout>
    ));
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('handles fetch error gracefully (shows nothing or fallback)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(() => (
      <Layout>
        <div>Content</div>
      </Layout>
    ));

    expect(screen.queryByText(/v/)).not.toBeInTheDocument();
  });

  it('loads the stored theme on mount', async () => {
    localStorage.setItem('theme', 'dark');

    render(() => (
      <Layout>
        <div>Content</div>
      </Layout>
    ));

    const toggle = await screen.findByLabelText('Toggle dark mode');
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(toggle).toBeChecked();
    });
  });

  it('toggles theme and updates localStorage', async () => {
    render(() => (
      <Layout>
        <div>Content</div>
      </Layout>
    ));

    const toggle = await screen.findByLabelText('Toggle dark mode');
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
