import { useContent } from '@/hooks/useContent';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';

interface ContentPageProps {
  slug: string;
}

export function ContentPage({ slug }: ContentPageProps) {
  const { data: content, isLoading } = useContent(slug);

  // Fallback content for common pages
  const fallbackContent = {
    about: {
      title: 'About Us',
      content: `
        <h2>Welcome to Guesty</h2>
        <p>Guesty is Malta's premier luxury property management and booking platform, connecting discerning travelers with exceptional accommodations across the Maltese islands.</p>

        <h3>Our Mission</h3>
        <p>We strive to provide an unparalleled experience for both property owners and guests, combining cutting-edge technology with personalized concierge services.</p>

        <h3>Why Choose Guesty?</h3>
        <ul>
          <li>Curated selection of premium properties</li>
          <li>24/7 concierge support</li>
          <li>Secure booking platform</li>
          <li>Local expertise and insights</li>
        </ul>

        <h3>Contact Us</h3>
        <p>Ready to experience Malta's finest accommodations? Get in touch with our team today.</p>
      `,
      meta: {
        title: 'About Us - Guesty',
        description: 'Learn about Malta\'s premier luxury property management and booking platform.'
      }
    }
  };

  const fallback = fallbackContent[slug as keyof typeof fallbackContent];
  const displayContent = content || (fallback ? {
    title: fallback.title,
    content: fallback.content,
    meta: fallback.meta
  } : null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: true,
      }),
    ],
    content: typeof displayContent?.content === 'string' ? displayContent.content : '',
    editable: false,
  }, [displayContent?.content]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!displayContent) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Safely extract meta information
  const getMetaTitle = (content: any): string => {
    if (content?.meta && typeof content.meta === 'object' && !Array.isArray(content.meta)) {
      const meta = content.meta as Record<string, any>;
      return typeof meta.title === 'string' ? meta.title : content.title;
    }
    return content?.title || 'Page';
  };

  const getMetaDescription = (content: any): string => {
    if (content?.meta && typeof content.meta === 'object' && !Array.isArray(content.meta)) {
      const meta = content.meta as Record<string, any>;
      return typeof meta.description === 'string' ? meta.description : '';
    }
    return '';
  };

  const metaTitle = getMetaTitle(displayContent);
  const metaDescription = getMetaDescription(displayContent);

  return (
    <Layout>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{displayContent.title}</h1>
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <EditorContent editor={editor} />
        </div>
      </div>
    </Layout>
  );
}
