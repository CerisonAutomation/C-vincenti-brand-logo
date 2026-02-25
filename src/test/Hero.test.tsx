import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Suspense } from "react";
import Hero from "@/components/Hero";

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <Suspense fallback={<div>Loading...</div>}>
        {component}
      </Suspense>
    </MemoryRouter>
  );
};

describe("Hero", () => {
  it("renders the hero sections correctly", async () => {
    const mockOnOpenWizard = vi.fn();

    renderWithRouter(<Hero onOpenWizard={mockOnOpenWizard} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Institutional");
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Residential");
      expect(screen.getByText("Initialize Management")).toBeInTheDocument();
      expect(screen.getByAltText("Luxury Mediterranean residence with sea view — Malta")).toBeInTheDocument();
    });
  });

  it("calls onOpenWizard when button is clicked", async () => {
    const mockOnOpenWizard = vi.fn();

    renderWithRouter(<Hero onOpenWizard={mockOnOpenWizard} />);

    await waitFor(() => {
      const button = screen.getByText("Initialize Management");
      fireEvent.click(button);
    });

    expect(mockOnOpenWizard).toHaveBeenCalledTimes(1);
  });

  it("has accessible attributes", async () => {
    const mockOnOpenWizard = vi.fn();

    renderWithRouter(<Hero onOpenWizard={mockOnOpenWizard} />);

    await waitFor(() => {
      const section = screen.getByLabelText("Hero section with owner and guest services");
      expect(section).toBeInTheDocument();

      const ownerSection = screen.getByLabelText("Owner services section");
      expect(ownerSection).toBeInTheDocument();

      const guestSection = screen.getByLabelText("Guest services section");
      expect(guestSection).toBeInTheDocument();
    });
  });
});
