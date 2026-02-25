import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useCreateContent, useUpdateContent } from '@/hooks/useContent';
import type { JSONContent } from '@tiptap/core';

interface ContentEditorProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content: JSONContent;
    published: boolean;
    meta?: { title?: string; description?: string; };
  };
  onSave?: () => void;
}

export function ContentEditor({ initialData, onSave }: ContentEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [published, setPublished] = useState(initialData?.published || false);
  const [metaTitle, setMetaTitle] = useState(initialData?.meta?.title || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.meta?.description || '');

  const createContent = useCreateContent();
  const updateContent = useUpdateContent();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your content...',
      }),
    ],
    content: initialData?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  const handleSave = async () => {
    if (!title || !slug) return;

    const contentData = {
      title,
      slug,
      content: editor?.getJSON() || {},
      published,
      meta: {
        title: metaTitle,
        description: metaDescription,
      },
    };

    try {
      if (initialData?.id) {
        await updateContent.mutateAsync({ id: initialData.id, ...contentData });
      } else {
        await createContent.mutateAsync(contentData);
      }
      onSave?.();
    } catch (error) {
      console.error('Failed to save content:', error);
    }
  };

  if (!editor) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="url-slug"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="published"
          checked={published}
          onCheckedChange={setPublished}
        />
        <Label htmlFor="published">Published</Label>
      </div>

      <div>
        <Label htmlFor="meta-title">Meta Title</Label>
        <Input
          id="meta-title"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder="SEO title"
        />
      </div>

      <div>
        <Label htmlFor="meta-description">Meta Description</Label>
        <Textarea
          id="meta-description"
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="SEO description"
          rows={3}
        />
      </div>

      <div>
        <Label>Content</Label>
        <div className="border rounded-md">
          <div className="flex gap-2 p-2 border-b">
            <Button
              variant={editor.isActive('bold') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              Bold
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              Italic
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              H2
            </Button>
            <Button
              variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              H3
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              Bullet List
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              Ordered List
            </Button>
          </div>
          <EditorContent editor={editor} className="min-h-[400px]" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={createContent.isPending || updateContent.isPending}>
        {createContent.isPending || updateContent.isPending ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
