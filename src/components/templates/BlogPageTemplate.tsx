import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';

interface BlogPageTemplateProps {
  posts: Array<{
    title: string;
    excerpt: string;
    date: string;
    author: string;
    image?: string;
    href: string;
  }>;
  className?: string;
}

export const BlogPageTemplate: React.FC<BlogPageTemplateProps> = ({
  posts,
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: 'Property Insights',
        subtitle: 'Blog & News',
        description: 'Stay informed with the latest trends, market analysis, and expert insights from the Malta property market.',
      },
    },
    {
      type: 'blog',
      props: {
        title: 'Latest Articles',
        posts,
      },
    },
    {
      type: 'cta',
      props: {
        title: 'Stay Updated',
        description: 'Subscribe to our newsletter for weekly property market insights and management tips.',
        buttonText: 'Subscribe Now',
        buttonOnClick: () => console.log('Subscribe clicked'),
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
