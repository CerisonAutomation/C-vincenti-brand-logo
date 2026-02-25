import { useContent } from '@/hooks/useContent';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Helmet } from 'react-helmet-async';

interface ContentPageProps {
  slug: string;
}

export function ContentPage({ slug }: ContentPageProps) {
  const { data: content, isLoading, error } = useContent(slug);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: true,
      }),
    ],
    content: content?.content || '',
    editable: false,
  }, [content?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{content.meta?.title || content.title}</title>
        <meta name="description" content={content.meta?.description || ''} />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{content.title}</h1>
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
