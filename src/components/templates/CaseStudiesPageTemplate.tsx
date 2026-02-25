import React from 'react';
import { PageTemplate, BlockType } from './PageTemplate';

interface CaseStudiesPageTemplateProps {
  caseStudies: Array<{
    title: string;
    client: string;
    challenge: string;
    solution: string;
    results: string;
    image: string;
  }>;
  className?: string;
}

export const CaseStudiesPageTemplate: React.FC<CaseStudiesPageTemplateProps> = ({
  caseStudies,
  className = '',
}) => {
  const blocks: BlockType[] = [
    {
      type: 'hero',
      props: {
        title: 'Case Studies',
        subtitle: 'Success Stories',
        description: 'See how we\'ve transformed property management for our clients.',
      },
    },
    ...caseStudies.map((study, index) => ({
      type: 'content' as const,
      props: {
        title: study.title,
        subtitle: `Client: ${study.client}`,
        content: (
          <div>
            <h4>Challenge</h4>
            <p>{study.challenge}</p>
            <h4>Solution</h4>
            <p>{study.solution}</p>
            <h4>Results</h4>
            <p>{study.results}</p>
          </div>
        ),
        image: study.image,
        imageAlt: study.title,
        reverse: index % 2 === 1,
      },
    })),
    {
      type: 'cta',
      props: {
        title: 'Ready for Your Success Story?',
        description: 'Contact us to see how we can transform your property management.',
        buttonText: 'Get Started',
        buttonOnClick: () => console.log('CTA clicked'),
      },
    },
  ];

  return <PageTemplate blocks={blocks} className={className} />;
};
