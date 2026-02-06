import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from '@solidjs/testing-library';
import Layout from '../Layout.tsx';

// mock the entire api module
vi.mock("../../lib/api", () => ({
  getBuildInfo: vi.fn(),
}));

import { getBuildInfo } from "../../lib/api.ts";

describe("Layout build info", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders children', () => {
    render(() => (
      <Layout>
        <div>Inner content</div>
      </Layout>
    ));

    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  it("displays build info when fetch succeeds", async () => {
    (getBuildInfo as vi.Mock).mockResolvedValue({
      commit: "abc1234567890",
      tag: "",
    });

    render(() => <Layout><div data-testid="child">Content</div></Layout>);

    // Wait for loading to disappear and dropdown content to appear
    const button = await screen.findByRole("button", { name: /Build Info/i });

    // Click to open dropdown
    button.click();

    // Use flexible matcher for split text (Commit: + span)
    expect(screen.getByText("Commit:")).toBeInTheDocument();
    expect(screen.getByText("abc1234")).toBeInTheDocument();
  });

  it("shows loading state initially", async () => {
    (getBuildInfo as vi.Mock).mockImplementationOnce(() => new Promise(() => {})); // never resolves
    render(() => <Layout><div>Content</div></Layout>);
    expect(screen.getByText("loading...")).toBeInTheDocument();
  });

  it("handles fetch error gracefully (shows nothing or fallback)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
    } as Response);

    render(() => <Layout><div>Content</div></Layout>);

    expect(screen.queryByText(/v/)).not.toBeInTheDocument();
  });
});
