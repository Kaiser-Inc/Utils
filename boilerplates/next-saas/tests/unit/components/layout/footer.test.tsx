import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("renders footer element", () => {
    render(<Footer />);
    const footer = document.querySelector("footer");
    expect(footer).not.toBeNull();
  });

  it("renders KaiserInc brand text", () => {
    render(<Footer />);
    expect(screen.getByText(/KaiserInc/)).toBeInTheDocument();
  });

  it("renders GitHub link with correct href", () => {
    render(<Footer />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/pHenrymelo");
  });

  it("renders GitHub link with target blank", () => {
    render(<Footer />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders GitHub link with noopener noreferrer rel", () => {
    render(<Footer />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders @pHenrymelo handle", () => {
    render(<Footer />);
    expect(screen.getByText("@pHenrymelo")).toBeInTheDocument();
  });
});
