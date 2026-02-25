import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';
import { LANDING_CONTENT } from '@/config/content';

interface LandingPageTemplateProps {
  onHeroAction: () => void;
  onCtaAction: () => void;
  onNewsletterSubscribe: (email: string) => void;
  className?: string;
}

export const LandingPageTemplate: React.FC<LandingPageTemplateProps> = ({
  onHeroAction,
  onCtaAction,
  onNewsletterSubscribe,
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: LANDING_CONTENT.hero.title,
        subtitle: LANDING_CONTENT.hero.subtitle,
        description: LANDING_CONTENT.hero.description,
        primaryButton: {
          text: LANDING_CONTENT.hero.primaryButton.text,
          onClick: onHeroAction,
        },
      },
    },
    {
      type: 'feature',
      props: {
        title: LANDING_CONTENT.features.title,
        description: LANDING_CONTENT.features.description,
        features: LANDING_CONTENT.features.items,
      },
    },
    {
      type: 'stats',
      props: {
        stats: LANDING_CONTENT.stats,
      },
    },
    {
      type: 'content',
      props: {
        title: 'About Our Services',
        content: 'We provide institutional-grade property management services with a focus on luxury residential properties in Malta. Our proprietary protocols ensure maximum performance and risk mitigation.',
        image: '/api/placeholder/600/400',
        imageAlt: 'Luxury property management office',
      },
    },
    {
      type: 'testimonial',
      props: {
        testimonials: LANDING_CONTENT.testimonial.quotes,
      },
    },
    {
      type: 'cta',
      props: {
        title: LANDING_CONTENT.cta.title,
        description: LANDING_CONTENT.cta.description,
        buttonText: LANDING_CONTENT.cta.buttonText,
        buttonOnClick: onCtaAction,
      },
    },
    {
      type: 'newsletter',
      props: {
        title: LANDING_CONTENT.newsletter.title,
        description: LANDING_CONTENT.newsletter.description,
        placeholder: LANDING_CONTENT.newsletter.placeholder,
        buttonText: LANDING_CONTENT.newsletter.buttonText,
        onSubscribe: onNewsletterSubscribe,
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
