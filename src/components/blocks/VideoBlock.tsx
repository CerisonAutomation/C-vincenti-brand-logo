import React from 'react';

interface VideoBlockProps {
  title?: string;
  description?: string;
  videoSrc: string;
  poster?: string;
  className?: string;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  title,
  description,
  videoSrc,
  poster,
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
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
        <div className="max-w-4xl mx-auto">
          <video
            controls
            poster={poster}
            className="w-full rounded-lg shadow-lg"
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};
