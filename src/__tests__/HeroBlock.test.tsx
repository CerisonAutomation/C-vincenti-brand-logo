import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HeroBlock } from '../components/blocks/HeroBlock';

describe('HeroBlock', () => {
  const defaultProps = {
    title: 'Welcome to Our Platform',
    description: 'This is a comprehensive hero section with accessibility features.',
    primaryButton: {
      text: 'Get Started',
      onClick: vi.fn(),
    },
    secondaryButton: {
      text: 'Learn More',
      onClick: vi.fn(),
    },
  };

  it('renders the hero section with correct semantic HTML', () => {
    render(<HeroBlock {...defaultProps} />);

    // Check semantic HTML
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    // Check heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Welcome to Our Platform');
    expect(heading).toHaveAttribute('id', 'hero-title');

    // Check description
    const description = screen.getByText('This is a comprehensive hero section with accessibility features.');
    expect(description).toHaveAttribute('id', 'hero-description');
  });

  it('renders primary and secondary buttons with proper accessibility', () => {
    render(<HeroBlock {...defaultProps} />);

    const primaryButton = screen.getByRole('button', { name: /primary action: get started/i });
    const secondaryButton = screen.getByRole('button', { name: /secondary action: learn more/i });

    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();

    // Check ARIA labels
    expect(primaryButton).toHaveAttribute('aria-label', 'Primary action: Get Started');
    expect(secondaryButton).toHaveAttribute('aria-label', 'Secondary action: Learn More');
  });

  it('handles button clicks correctly', () => {
    render(<HeroBlock {...defaultProps} />);

    const primaryButton = screen.getByRole('button', { name: /primary action: get started/i });
    const secondaryButton = screen.getByRole('button', { name: /secondary action: learn more/i });

    fireEvent.click(primaryButton);
    fireEvent.click(secondaryButton);

    expect(defaultProps.primaryButton.onClick).toHaveBeenCalledTimes(1);
    expect(defaultProps.secondaryButton.onClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard navigation for buttons', () => {
    render(<HeroBlock {...defaultProps} />);

    const primaryButton = screen.getByRole('button', { name: /primary action: get started/i });

    // Test Enter key
    fireEvent.keyDown(primaryButton, { key: 'Enter', code: 'Enter' });
    expect(defaultProps.primaryButton.onClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(primaryButton, { key: ' ', code: 'Space' });
    expect(defaultProps.primaryButton.onClick).toHaveBeenCalledTimes(2);
  });

  it('renders optional subtitle when provided', () => {
    const propsWithSubtitle = {
      ...defaultProps,
      subtitle: 'Luxury Property Management',
    };

    render(<HeroBlock {...propsWithSubtitle} />);

    const subtitle = screen.getByText('Luxury Property Management');
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveAttribute('aria-label', 'Hero subtitle');
  });

  it('renders background image when provided', () => {
    const propsWithImage = {
      ...defaultProps,
      backgroundImage: '/test-image.jpg',
    };

    render(<HeroBlock {...propsWithImage} />);

    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({ backgroundImage: 'url(/test-image.jpg)' });

    // Check screen reader announcement
    const srAnnouncement = screen.getByText('Hero section with background image');
    expect(srAnnouncement).toHaveClass('sr-only');
    expect(srAnnouncement).toHaveAttribute('aria-live', 'polite');
  });

  it('renders skip link for screen readers', () => {
    render(<HeroBlock {...defaultProps} />);

    const skipLink = screen.getByRole('link', { hidden: true });
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(skipLink).toHaveTextContent('Skip to main content');
    expect(skipLink).toHaveClass('sr-only');
  });

  it('applies custom className', () => {
    render(<HeroBlock {...defaultProps} className="custom-hero" />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-hero');
  });

  it('handles missing optional buttons gracefully', () => {
    const propsWithoutButtons = {
      title: 'Simple Hero',
      description: 'No buttons here',
    };

    render(<HeroBlock {...propsWithoutButtons} />);

    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
  });

  // Visual regression test (placeholder - would use visual testing library)
  it('matches visual snapshot', () => {
    const { container } = render(<HeroBlock {...defaultProps} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
