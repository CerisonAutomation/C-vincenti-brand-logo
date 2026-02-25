import React from 'react';

interface StatsBlockProps {
  stats: Array<{
    value: string;
    label: string;
  }>;
  className?: string;
}

export const StatsBlock: React.FC<StatsBlockProps> = ({
  stats,
  className = '',
}) => {
  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <p className="text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
