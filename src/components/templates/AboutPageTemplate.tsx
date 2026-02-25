import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';
import { ABOUT_CONTENT } from '@/config/content';

interface AboutPageTemplateProps {
  className?: string;
}

export const AboutPageTemplate: React.FC<AboutPageTemplateProps> = ({
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: ABOUT_CONTENT.hero.title,
        subtitle: ABOUT_CONTENT.hero.subtitle,
        description: ABOUT_CONTENT.hero.description,
      },
    },
    {
      type: 'content',
      props: {
        title: ABOUT_CONTENT.mission.title,
        content: ABOUT_CONTENT.mission.content,
        image: ABOUT_CONTENT.mission.image,
        imageAlt: ABOUT_CONTENT.mission.imageAlt,
      },
    },
    {
      type: 'timeline',
      props: {
        title: ABOUT_CONTENT.timeline.title,
        events: ABOUT_CONTENT.timeline.events,
      },
    },
    {
      type: 'team',
      props: {
        title: ABOUT_CONTENT.team.title,
        members: ABOUT_CONTENT.team.members,
      },
    },
    {
      type: 'quote',
      props: {
        quote: ABOUT_CONTENT.quote.quote,
        author: ABOUT_CONTENT.quote.author,
        role: ABOUT_CONTENT.quote.role,
      },
    },
    {
      type: 'stats',
      props: {
        stats: ABOUT_CONTENT.stats,
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
