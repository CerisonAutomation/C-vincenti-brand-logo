import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';
import { SERVICES_CONTENT } from '@/config/content';

interface ServicesPageTemplateProps {
  onContactClick: () => void;
  className?: string;
}

export const ServicesPageTemplate: React.FC<ServicesPageTemplateProps> = ({
  onContactClick,
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: SERVICES_CONTENT.hero.title,
        subtitle: SERVICES_CONTENT.hero.subtitle,
        description: SERVICES_CONTENT.hero.description,
      },
    },
    {
      type: 'feature',
      props: {
        title: SERVICES_CONTENT.features.title,
        description: SERVICES_CONTENT.features.description,
        features: SERVICES_CONTENT.features.items,
      },
    },
    {
      type: 'content',
      props: {
        title: SERVICES_CONTENT.institutional.title,
        content: SERVICES_CONTENT.institutional.content,
        reverse: true,
        image: SERVICES_CONTENT.institutional.image,
        imageAlt: SERVICES_CONTENT.institutional.imageAlt,
      },
    },
    {
      type: 'pricing',
      props: {
        plans: SERVICES_CONTENT.pricing.plans,
      },
    },
    {
      type: 'faq',
      props: {
        title: SERVICES_CONTENT.faq.title,
        faqs: SERVICES_CONTENT.faq.items,
      },
    },
    {
      type: 'cta',
      props: {
        title: SERVICES_CONTENT.cta.title,
        description: SERVICES_CONTENT.cta.description,
        buttonText: SERVICES_CONTENT.cta.buttonText,
        buttonOnClick: onContactClick,
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
