import { render, screen } from "@solidjs/testing-library";
import Layout from "./Layout";

it("renders children", () => {
    render(() => (
        <Layout>
            <div>Inner content</div>
        </Layout>
    ));

    expect(screen.getByText("Inner content")).toBeInTheDocument();
});
