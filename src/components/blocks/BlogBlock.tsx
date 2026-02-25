import React from 'react';

interface BlogBlockProps {
  title?: string;
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

export const BlogBlock: React.FC<BlogBlockProps> = ({
  title = 'Latest Posts',
  posts,
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <article key={index} className="bg-card rounded-lg shadow-sm overflow-hidden">
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  <a href={post.href} className="hover:text-primary transition-colors">
                    {post.title}
                  </a>
                </h3>
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{post.author}</span>
                  <span className="mx-2">·</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
