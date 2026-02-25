import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Hero from "@/components/Hero";

describe("Hero", () => {
  it("renders the hero sections correctly", () => {
    const mockOnOpenWizard = vi.fn();

    render(<Hero onOpenWizard={mockOnOpenWizard} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Institutional");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Residential");
    expect(screen.getByText("Initialize Management")).toBeInTheDocument();
    expect(screen.getByAltText("Luxury Mediterranean residence with sea view — Malta")).toBeInTheDocument();
  });

  it("calls onOpenWizard when button is clicked", () => {
    const mockOnOpenWizard = vi.fn();

    render(<Hero onOpenWizard={mockOnOpenWizard} />);

    const button = screen.getByText("Initialize Management");
    fireEvent.click(button);

    expect(mockOnOpenWizard).toHaveBeenCalledTimes(1);
  });

  it("has accessible attributes", () => {
    const mockOnOpenWizard = vi.fn();

    render(<Hero onOpenWizard={mockOnOpenWizard} />);

    const section = screen.getByLabelText("Hero section with owner and guest services");
    expect(section).toBeInTheDocument();

    const ownerSection = screen.getByLabelText("Owner services section");
    expect(ownerSection).toBeInTheDocument();

    const guestSection = screen.getByLabelText("Guest services section");
    expect(guestSection).toBeInTheDocument();
  });
});
