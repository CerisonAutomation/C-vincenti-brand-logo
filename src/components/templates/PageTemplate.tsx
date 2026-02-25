import React from 'react';
import { HeroBlock } from './blocks/HeroBlock';
import { FeatureBlock } from './blocks/FeatureBlock';
import { ContentBlock } from './blocks/ContentBlock';
import { CallToActionBlock } from './blocks/CallToActionBlock';
import { TestimonialBlock } from './blocks/TestimonialBlock';
import { StatsBlock } from './blocks/StatsBlock';
import { GalleryBlock } from './blocks/GalleryBlock';
import { FooterBlock } from './blocks/FooterBlock';
import { PricingBlock } from './blocks/PricingBlock';
import { HeaderBlock } from './blocks/HeaderBlock';
import { ContactBlock } from './blocks/ContactBlock';
import { NewsletterBlock } from './blocks/NewsletterBlock';
import { TeamBlock } from './blocks/TeamBlock';
import { FAQBlock } from './blocks/FAQBlock';
import { BlogBlock } from './blocks/BlogBlock';
import { TimelineBlock } from './blocks/TimelineBlock';
import { VideoBlock } from './blocks/VideoBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { MapBlock } from './blocks/MapBlock';

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
  | { type: 'map'; props: React.ComponentProps<typeof MapBlock> };

interface PageTemplateProps {
  blocks: BlockType[];
  className?: string;
}

export const PageTemplate: React.FC<PageTemplateProps> = ({
  blocks,
  className = '',
}) => {
  return (
    <div className={className}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'hero':
            return <HeroBlock key={index} {...block.props} />;
          case 'feature':
            return <FeatureBlock key={index} {...block.props} />;
          case 'content':
            return <ContentBlock key={index} {...block.props} />;
          case 'cta':
            return <CallToActionBlock key={index} {...block.props} />;
          case 'testimonial':
            return <TestimonialBlock key={index} {...block.props} />;
          case 'stats':
            return <StatsBlock key={index} {...block.props} />;
          case 'gallery':
            return <GalleryBlock key={index} {...block.props} />;
          case 'footer':
            return <FooterBlock key={index} {...block.props} />;
          case 'pricing':
            return <PricingBlock key={index} {...block.props} />;
          case 'header':
            return <HeaderBlock key={index} {...block.props} />;
          case 'contact':
            return <ContactBlock key={index} {...block.props} />;
          case 'newsletter':
            return <NewsletterBlock key={index} {...block.props} />;
          case 'team':
            return <TeamBlock key={index} {...block.props} />;
          case 'faq':
            return <FAQBlock key={index} {...block.props} />;
          case 'blog':
            return <BlogBlock key={index} {...block.props} />;
          case 'timeline':
            return <TimelineBlock key={index} {...block.props} />;
          case 'video':
            return <VideoBlock key={index} {...block.props} />;
          case 'quote':
            return <QuoteBlock key={index} {...block.props} />;
          case 'map':
            return <MapBlock key={index} {...block.props} />;
          default:
            return null;
        }
      })}
    </div>
  );
};
