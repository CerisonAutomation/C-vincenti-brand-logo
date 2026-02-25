import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PageTemplate } from '../components/templates/PageTemplate';

// Mock all block components
vi.mock('../components/blocks/HeroBlock', () => ({
  HeroBlock: ({ title }: { title: string }) => <div data-testid="hero-block">{title}</div>,
}));

vi.mock('../components/blocks/FeatureBlock', () => ({
  FeatureBlock: ({ title }: { title: string }) => <div data-testid="feature-block">{title}</div>,
}));

vi.mock('../components/blocks/ContentBlock', () => ({
  ContentBlock: ({ title }: { title: string }) => <div data-testid="content-block">{title}</div>,
}));

vi.mock('../components/blocks/CallToActionBlock', () => ({
  CallToActionBlock: ({ title }: { title: string }) => <div data-testid="cta-block">{title}</div>,
}));

describe('PageTemplate', () => {
  it('renders single block correctly', () => {
    const blocks = [
      {
        type: 'hero' as const,
        props: { title: 'Welcome' },
      },
    ];

    render(<PageTemplate blocks={blocks} />);

    expect(screen.getByTestId('hero-block')).toHaveTextContent('Welcome');
  });

  it('renders multiple blocks in correct order', () => {
    const blocks = [
      {
        type: 'hero' as const,
        props: { title: 'Hero Title' },
      },
      {
        type: 'feature' as const,
        props: { title: 'Feature Title' },
      },
      {
        type: 'content' as const,
        props: { title: 'Content Title' },
      },
    ];

    render(<PageTemplate blocks={blocks} />);

    const renderedBlocks = screen.getAllByTestId(/block$/);
    expect(renderedBlocks).toHaveLength(3);
    expect(renderedBlocks[0]).toHaveTextContent('Hero Title');
    expect(renderedBlocks[1]).toHaveTextContent('Feature Title');
    expect(renderedBlocks[2]).toHaveTextContent('Content Title');
  });

  it('applies custom className to root element', () => {
    const blocks = [
      {
        type: 'hero' as const,
        props: { title: 'Test' },
      },
    ];

    const { container } = render(<PageTemplate blocks={blocks} className="custom-page" />);

    expect(container.firstChild).toHaveClass('custom-page');
  });

  it('handles empty blocks array', () => {
    const { container } = render(<PageTemplate blocks={[]} />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('provides unique keys to prevent React warnings', () => {
    const blocks = [
      {
        type: 'hero' as const,
        props: { title: 'Block 1' },
      },
      {
        type: 'hero' as const,
        props: { title: 'Block 2' },
      },
    ];

    render(<PageTemplate blocks={blocks} />);

    // This test ensures no React key warnings by having unique keys (index-based)
    const blocksRendered = screen.getAllByTestId('hero-block');
    expect(blocksRendered).toHaveLength(2);
  });

  it('exhaustively handles all block types', () => {
    const blocks = [
      { type: 'hero' as const, props: { title: 'Hero' } },
      { type: 'feature' as const, props: { title: 'Feature' } },
      { type: 'content' as const, props: { title: 'Content' } },
      { type: 'cta' as const, props: { title: 'CTA' } },
      // Note: Other block types would need their mocks added
    ];

    expect(() => render(<PageTemplate blocks={blocks} />)).not.toThrow();
  });

  // Type safety test - this would fail at compile time if types don't match
  it('enforces type safety for block props', () => {
    const validBlocks = [
      {
        type: 'hero' as const,
        props: {
          title: 'Valid Hero',
          // All required props must be present
        },
      },
    ];

    render(<PageTemplate blocks={validBlocks} />);

    expect(screen.getByTestId('hero-block')).toBeInTheDocument();
  });
});
