import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';

interface PortfolioPageTemplateProps {
  properties: Array<{
    title: string;
    location: string;
    type: string;
    image: string;
    href: string;
  }>;
  className?: string;
}

export const PortfolioPageTemplate: React.FC<PortfolioPageTemplateProps> = ({
  properties,
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: 'Our Portfolio',
        subtitle: 'Managed Properties',
        description: 'Explore our curated collection of premium properties across Malta and Gozo.',
      },
    },
    {
      type: 'gallery',
      props: {
        title: 'Featured Properties',
        images: properties.map(prop => ({
          src: prop.image,
          alt: prop.title,
        })),
      },
    },
    {
      type: 'content',
      props: {
        title: 'Property Management Excellence',
        content: 'Each property in our portfolio receives the same level of professional care and attention to detail. From luxury villas to premium apartments, we ensure every property performs at its highest potential.',
        image: '/api/placeholder/600/400',
        imageAlt: 'Property management excellence',
      },
    },
    {
      type: 'stats',
      props: {
        stats: [
          { value: '500+', label: 'Total Properties' },
          { value: '€50M+', label: 'Portfolio Value' },
          { value: '15+', label: 'Years Average' },
          { value: '98%', label: 'Occupancy Rate' },
        ],
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
