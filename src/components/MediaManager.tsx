import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, File, Image as ImageIcon, Video, FileText } from 'lucide-react';
import { useMedia, useUploadMedia } from '@/hooks/useContent';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function MediaManager() {
  const { data: media, isLoading } = useMedia();
  const uploadMedia = useUploadMedia();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        await uploadMedia.mutateAsync(file);
        toast.success(`Uploaded ${file.name}`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }, [uploadMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'application/*': ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Delete ${filename}?`)) return;

    try {
      // Delete from database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('media_files')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([`media/${filename}`]);

      if (storageError) console.warn('Storage delete failed:', storageError);

      toast.success('Media deleted');
      // Refetch will happen via query invalidation in hook
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading media...</div>;
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to select files (images, videos, documents up to 50MB)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {media?.map((item) => (
          <Card key={item.id} className="relative group">
            <CardContent className="p-4">
              <div className="aspect-square bg-secondary rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || item.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getIcon(item.type)
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium truncate">{item.filename}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{item.type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {(item.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(item.url)}
                  className="w-full"
                >
                  Copy URL
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(item.id, item.filename)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!media || media.length === 0) && (
        <div className="text-center py-12">
          <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No media uploaded yet</p>
          <p className="text-sm text-muted-foreground">
            Upload images, videos, and documents to get started
          </p>
        </div>
      )}
    </div>
  );
}
