import { render, screen } from '@solidjs/testing-library';
import Layout from '../Layout.tsx';

it('renders children', () => {
  render(() => (
    <Layout>
      <div>Inner content</div>
    </Layout>
  ));

  expect(screen.getByText('Inner content')).toBeInTheDocument();
});

describe("Layout build info", () => {
  it("displays build info when fetch succeeds", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        commit: "abc123456789",
        version: "1.2.3",
        buildDate: "2026-02-03T12:00:00Z",
      }),
    } as Response);

    render(() => <Layout><div data-testid="child">Content</div></Layout>);

    expect(screen.getByText(/v1.2.3 \(abc1234\)/)).toBeInTheDocument();
    expect(screen.getByText(/2\/3\/2026/)).toBeInTheDocument();
  });

  it("shows loading state initially", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(() => new Promise(() => {})); // never resolves
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
