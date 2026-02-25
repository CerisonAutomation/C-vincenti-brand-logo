import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';

interface CareersPageTemplateProps {
  onApplyClick: () => void;
  className?: string;
}

export const CareersPageTemplate: React.FC<CareersPageTemplateProps> = ({
  onApplyClick,
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: 'Join Our Team',
        subtitle: 'Careers',
        description: 'Be part of Malta\'s leading luxury property management firm. We\'re always looking for talented individuals to join our growing team.',
      },
    },
    {
      type: 'content',
      props: {
        title: 'Why Work With Us?',
        content: 'We offer competitive salaries, professional development opportunities, and the chance to work with premium properties in one of Europe\'s most beautiful locations.',
        image: '/api/placeholder/600/400',
        imageAlt: 'Our office environment',
      },
    },
    {
      type: 'feature',
      props: {
        title: 'What We Offer',
        description: 'Comprehensive benefits and growth opportunities for our team members.',
        features: [
          {
            icon: <span>💰</span>,
            title: 'Competitive Salary',
            description: 'Market-leading compensation with performance bonuses.',
          },
          {
            icon: <span>📚</span>,
            title: 'Professional Development',
            description: 'Ongoing training and certification opportunities.',
          },
          {
            icon: <span>🏖️</span>,
            title: 'Work-Life Balance',
            description: 'Flexible working arrangements and generous vacation time.',
          },
          {
            icon: <span>🌍</span>,
            title: 'International Exposure',
            description: 'Work with clients from around the world in a multicultural environment.',
          },
        ],
      },
    },
    {
      type: 'team',
      props: {
        title: 'Current Openings',
        members: [
          {
            name: 'Property Manager',
            role: 'Full-time',
            bio: 'Manage a portfolio of luxury residential properties. Requires 3+ years experience in property management.',
          },
          {
            name: 'Marketing Coordinator',
            role: 'Full-time',
            bio: 'Develop marketing strategies for property listings. Experience in digital marketing preferred.',
          },
          {
            name: 'Financial Analyst',
            role: 'Full-time',
            bio: 'Analyze property performance and financial metrics. Accounting background required.',
          },
        ],
      },
    },
    {
      type: 'cta',
      props: {
        title: 'Ready to Apply?',
        description: 'Send us your resume and cover letter. We\'re excited to hear from you!',
        buttonText: 'Apply Now',
        buttonOnClick: onApplyClick,
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
