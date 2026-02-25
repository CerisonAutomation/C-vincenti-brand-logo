import React, { Suspense } from 'react';
import ErrorBoundary from '../ErrorBoundary';

// Lazy-loaded block components for performance optimization
const HeroBlock = React.lazy(() => import('./blocks/HeroBlock'));
const FeatureBlock = React.lazy(() => import('./blocks/FeatureBlock'));
const ContentBlock = React.lazy(() => import('./blocks/ContentBlock'));
const CallToActionBlock = React.lazy(() => import('./blocks/CallToActionBlock'));
const TestimonialBlock = React.lazy(() => import('./blocks/TestimonialBlock'));
const StatsBlock = React.lazy(() => import('./blocks/StatsBlock'));
const GalleryBlock = React.lazy(() => import('./blocks/GalleryBlock'));
const FooterBlock = React.lazy(() => import('./blocks/FooterBlock'));
const PricingBlock = React.lazy(() => import('./blocks/PricingBlock'));
const HeaderBlock = React.lazy(() => import('./blocks/HeaderBlock'));
const ContactBlock = React.lazy(() => import('./blocks/ContactBlock'));
const NewsletterBlock = React.lazy(() => import('./blocks/NewsletterBlock'));
const TeamBlock = React.lazy(() => import('./blocks/TeamBlock'));
const FAQBlock = React.lazy(() => import('./blocks/FAQBlock'));
const BlogBlock = React.lazy(() => import('./blocks/BlogBlock'));
const TimelineBlock = React.lazy(() => import('./blocks/TimelineBlock'));
const VideoBlock = React.lazy(() => import('./blocks/VideoBlock'));
const QuoteBlock = React.lazy(() => import('./blocks/QuoteBlock'));
const MapBlock = React.lazy(() => import('./blocks/MapBlock'));

/**
 * Discriminated union type for all supported page block types.
 * Each block type is mapped to its corresponding component props.
 * This ensures type safety when composing pages with blocks.
 */
interface UnknownBlock {
  type: string;
  props: Record<string, unknown>;
}

export type BlockType =
  | { type: 'hero'; props: React.ComponentProps<typeof HeroBlock> }
  | { type: 'feature'; props: React.ComponentProps<typeof FeatureBlock> }
  | { type: 'content'; props: React.ComponentProps<typeof ContentBlock> }
  | { type: 'cta'; props: React.ComponentProps<typeof CallToActionBlock> }
  | { type: 'testimonial'; props: React.ComponentProps<typeof TestimonialBlock> }
  | { type: 'stats'; props: React.ComponentProps<typeof StatsBlock> }
  | { type: 'gallery'; props: React.ComponentProps<typeof GalleryBlock> }
  | { type: 'footer'; props: React.ComponentProps<typeof FooterBlock> }
  | { type: 'pricing'; props: React.ComponentProps<typeof PricingBlock> }
  | { type: 'header'; props: React.ComponentProps<typeof HeaderBlock> }
  | { type: 'contact'; props: React.ComponentProps<typeof ContactBlock> }
  | { type: 'newsletter'; props: React.ComponentProps<typeof NewsletterBlock> }
  | { type: 'team'; props: React.ComponentProps<typeof TeamBlock> }
  | { type: 'faq'; props: React.ComponentProps<typeof FAQBlock> }
  | { type: 'blog'; props: React.ComponentProps<typeof BlogBlock> }
  | { type: 'timeline'; props: React.ComponentProps<typeof TimelineBlock> }
  | { type: 'video'; props: React.ComponentProps<typeof VideoBlock> }
  | { type: 'quote'; props: React.ComponentProps<typeof QuoteBlock> }
  | { type: 'map'; props: React.ComponentProps<typeof MapBlock> }
  | UnknownBlock;

// Skeleton fallback component for lazy loading
const BlockSkeleton = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`w-full ${height} bg-secondary/50 animate-pulse rounded-lg`} />
);

/**
 * Props interface for the PageTemplate component.
 * Defines the structure for rendering a collection of typed blocks.
 */
interface PageTemplateProps {
  /** Array of block configurations to render */
  blocks: BlockType[];
  /** Optional CSS class name for the root container */
  className?: string;
}

/**
 * PageTemplate component that renders a collection of typed blocks.
 * This is the central rendering engine for the block-based composition system.
 *
 * Features:
 * - Type-safe block rendering via discriminated union
 * - Automatic component instantiation based on block type
 * - Performance optimized with React keys
 * - Extensible architecture for adding new block types
 *
 * @param props - The component props
 * @returns JSX element containing rendered blocks
 *
 * @example
 * ```tsx
 * const blocks: BlockType[] = [
 *   { type: 'hero', props: { title: 'Welcome' } },
 *   { type: 'feature', props: { features: [...] } }
 * ];
 *
 * return <PageTemplate blocks={blocks} className="page-content" />;
 * ```
 */
export const PageTemplate: React.FC<PageTemplateProps> = ({
  blocks,
  className = '',
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-96 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">Template Error</h3>
          <p className="text-sm text-muted-foreground">Failed to load page content. Please refresh the page.</p>
        </div>
      }
    >
      <div className={className}>
        {blocks.map((block, index) => {
          switch (block.type) {
          case 'hero':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-96 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Hero Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load hero section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-96" />}>
                  <HeroBlock {...(block.props as React.ComponentProps<typeof HeroBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'feature':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-80 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Features Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load features section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-80" />}>
                  <FeatureBlock {...(block.props as React.ComponentProps<typeof FeatureBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'content':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-64 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Content Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load content section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-64" />}>
                  <ContentBlock {...(block.props as React.ComponentProps<typeof ContentBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'cta':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-48 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Call-to-Action Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load CTA section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-48" />}>
                  <CallToActionBlock {...(block.props as React.ComponentProps<typeof CallToActionBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'testimonial':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-72 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Testimonials Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load testimonials section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-72" />}>
                  <TestimonialBlock {...(block.props as React.ComponentProps<typeof TestimonialBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'stats':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-56 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Statistics Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load statistics section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-56" />}>
                  <StatsBlock {...(block.props as React.ComponentProps<typeof StatsBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'gallery':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-96 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Gallery Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load gallery section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-96" />}>
                  <GalleryBlock {...(block.props as React.ComponentProps<typeof GalleryBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'footer':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-64 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Footer Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load footer section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-64" />}>
                  <FooterBlock {...(block.props as React.ComponentProps<typeof FooterBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'pricing':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-96 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Pricing Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load pricing section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-96" />}>
                  <PricingBlock {...(block.props as React.ComponentProps<typeof PricingBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'header':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-32 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Header Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load header section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-32" />}>
                  <HeaderBlock {...(block.props as React.ComponentProps<typeof HeaderBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'contact':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-80 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Contact Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load contact section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-80" />}>
                  <ContactBlock {...(block.props as React.ComponentProps<typeof ContactBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'newsletter':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-48 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Newsletter Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load newsletter section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-48" />}>
                  <NewsletterBlock {...(block.props as React.ComponentProps<typeof NewsletterBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'team':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-96 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Team Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load team section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-96" />}>
                  <TeamBlock {...(block.props as React.ComponentProps<typeof TeamBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'faq':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-80 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">FAQ Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load FAQ section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-80" />}>
                  <FAQBlock {...(block.props as React.ComponentProps<typeof FAQBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'blog':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-96 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Blog Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load blog section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-96" />}>
                  <BlogBlock {...(block.props as React.ComponentProps<typeof BlogBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'timeline':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-80 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Timeline Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load timeline section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-80" />}>
                  <TimelineBlock {...(block.props as React.ComponentProps<typeof TimelineBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'video':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-64 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Video Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load video section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-64" />}>
                  <VideoBlock {...(block.props as React.ComponentProps<typeof VideoBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'quote':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-48 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Quote Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load quote section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-48" />}>
                  <QuoteBlock {...(block.props as React.ComponentProps<typeof QuoteBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          case 'map':
            return (
              <ErrorBoundary
                key={index}
                fallback={
                  <div className="min-h-72 bg-destructive/10 border border-destructive/20 rounded-lg p-8 text-center">
                    <h3 className="text-lg font-semibold text-destructive mb-2">Map Block Error</h3>
                    <p className="text-sm text-muted-foreground">Failed to load map section.</p>
                  </div>
                }
              >
                <Suspense key={index} fallback={<BlockSkeleton height="h-72" />}>
                  <MapBlock {...(block.props as React.ComponentProps<typeof MapBlock>)} />
                </Suspense>
              </ErrorBoundary>
            );
          default:
            return (
              <div key={index} className="min-h-48 bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Unknown Block Type</h3>
                <p className="text-sm text-yellow-700">Block type "{(block as UnknownBlock).type}" is not supported.</p>
              </div>
            );
          }
        })}
      </div>
    </ErrorBoundary>
  );
};
