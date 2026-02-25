import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAllContent, useDeleteContent } from '@/hooks/useContent';
import { ContentEditor } from './ContentEditor';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';
import type { JSONContent } from '@tiptap/core';

type ContentPageRow = Tables<'content_pages'>['Row'];

export function ContentManager() {
  const { data: content, isLoading } = useAllContent();
  const deleteContent = useDeleteContent();
  const [selectedContent, setSelectedContent] = useState<ContentPageRow | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleEdit = (item: ContentPageRow) => {
    setSelectedContent(item);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedContent(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;

    try {
      await deleteContent.mutateAsync(id);
      toast.success('Content deleted');
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const handleSave = () => {
    setDialogOpen(false);
    setSelectedContent(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Content Pages</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedContent ? 'Edit Page' : 'New Page'}</DialogTitle>
            </DialogHeader>
            <ContentEditor
              initialData={selectedContent ? {
                id: selectedContent.id,
                title: selectedContent.title,
                slug: selectedContent.slug,
                content: selectedContent.content as JSONContent,
                published: selectedContent.published || false,
                meta: selectedContent.meta as { title?: string; description?: string; } | undefined,
              } : undefined}
              onSave={handleSave}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {content?.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={item.published ? 'default' : 'secondary'}>
                    {item.published ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                    {item.published ? 'Published' : 'Draft'}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Slug: /{item.slug}</p>
              <p className="text-sm">
                Created: {new Date(item.created_at || '').toLocaleDateString()}
                {item.updated_at !== item.created_at && (
                  <> • Updated: {new Date(item.updated_at || '').toLocaleDateString()}</>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!content || content.length === 0) && (
        <div className="text-center py-12">
          <Plus className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No content pages yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first content page to get started
          </p>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Create Page
          </Button>
        </div>
      )}
    </div>
  );
}
