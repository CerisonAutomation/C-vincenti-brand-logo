import React from 'react';

interface GalleryBlockProps {
  title?: string;
  images: Array<{
    src: string;
    alt: string;
  }>;
  className?: string;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  title,
  images,
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-lg">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
