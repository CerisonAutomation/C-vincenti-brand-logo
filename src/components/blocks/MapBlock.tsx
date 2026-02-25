import React from 'react';

interface MapBlockProps {
  title?: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  className?: string;
}

export const MapBlock: React.FC<MapBlockProps> = ({
  title = 'Find Us',
  description,
  address,
  latitude,
  longitude,
  className = '',
}) => {
  return (
    <section className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {description}
            </p>
          )}
          <p className="text-muted-foreground">{address}</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-muted-foreground">Map integration would go here</p>
              <p className="text-sm text-muted-foreground">Lat: {latitude}, Lng: {longitude}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
