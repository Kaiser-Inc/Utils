import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/image before importing Logo
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // biome-ignore lint: test mock
    return <img {...props} />;
  },
}));

import { Logo } from "@/components/shared/logo";

describe("Logo", () => {
  it("renders an image element", () => {
    render(<Logo />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
  });

  it("has correct alt text", () => {
    render(<Logo />);
    const img = screen.getByAltText("KaiserInc");
    expect(img).toBeInTheDocument();
  });

  it("uses default size of 96", () => {
    render(<Logo />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "96");
    expect(img).toHaveAttribute("height", "96");
  });

  it("accepts custom size prop", () => {
    render(<Logo size={48} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "48");
    expect(img).toHaveAttribute("height", "48");
  });

  it("applies className prop", () => {
    render(<Logo className="custom-class" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("class", "custom-class");
  });

  it("uses correct src", () => {
    render(<Logo />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/logo-kaiser.png");
  });
});
