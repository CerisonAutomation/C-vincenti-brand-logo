import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("renders the brand name and sub text correctly", () => {
    render(<Logo />);

    const logoImg = screen.getByAltText(/Christiano Vincenti PROPERTY MANAGEMENT/i);
    expect(logoImg).toBeInTheDocument();
  });

  it("has correct aria-label", () => {
    render(<Logo />);

    const logo = screen.getByRole("button");
    expect(logo).toHaveAttribute("aria-label", "Christiano Vincenti Home");
  });

  it("calls custom onClick when provided", () => {
    const mockOnClick = vi.fn();
    render(<Logo onClick={mockOnClick} />);

    const logo = screen.getByRole("button");
    fireEvent.click(logo);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("scrolls to top when no onClick provided", () => {
    const scrollToMock = vi.fn();
    Object.defineProperty(window, "scrollTo", {
      writable: true,
      value: scrollToMock,
    });

    render(<Logo />);

    const logo = screen.getByRole("button");
    fireEvent.click(logo);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("renders with custom subText", () => {
    render(<Logo subText="Custom Label" />);

    const logoImg = screen.getByAltText(/Christiano Vincenti Custom Label/i);
    expect(logoImg).toBeInTheDocument();
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Logo size="sm" />);
    let logoImg = screen.getByAltText(/Christiano Vincenti/i);
    expect(logoImg).toHaveClass("w-32");

    rerender(<Logo size="lg" />);
    logoImg = screen.getByAltText(/Christiano Vincenti/i);
    expect(logoImg).toHaveClass("w-64");
  });
});
