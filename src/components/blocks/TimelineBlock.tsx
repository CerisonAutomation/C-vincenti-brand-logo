import React from 'react';

interface TimelineBlockProps {
  title?: string;
  events: Array<{
    date: string;
    title: string;
    description: string;
  }>;
  className?: string;
}

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  title = 'Timeline',
  events,
  className = '',
}) => {
  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-center mb-12">
            {title}
          </h2>
        )}
        <div className="max-w-4xl mx-auto">
          {events.map((event, index) => (
            <div key={index} className="flex mb-8">
              <div className="flex flex-col items-center mr-8">
                <div className="w-4 h-4 bg-primary rounded-full"></div>
                {index < events.length - 1 && <div className="w-0.5 h-16 bg-border mt-2"></div>}
              </div>
              <div className="flex-1">
                <div className="bg-card p-6 rounded-lg shadow-sm">
                  <div className="text-sm text-primary font-medium mb-2">{event.date}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{event.title}</h3>
                  <p className="text-muted-foreground">{event.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
