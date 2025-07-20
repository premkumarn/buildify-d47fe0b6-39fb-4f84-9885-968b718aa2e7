
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Resource, Kit, Language } from '@/types';

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  description: z.string().optional(),
  kit_id: z.string().uuid({ message: 'Please select a kit' }),
  language_id: z.string().uuid({ message: 'Please select a language' }),
  resource_type: z.enum(['pdf', 'video', 'audio'], { 
    required_error: 'Please select a resource type' 
  }),
  file: z.instanceof(File).optional(),
  thumbnail: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ResourceFormProps {
  resource?: Resource;
  onSuccess?: () => void;
}

const ResourceForm: React.FC<ResourceFormProps> = ({ resource, onSuccess }) => {
  const { toast } = useToast();
  const [kits, setKits] = useState<Kit[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    resource?.thumbnail_url || null
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resource?.title || '',
      description: resource?.description || '',
      kit_id: resource?.kit_id || '',
      language_id: resource?.language_id || '',
      resource_type: resource?.resource_type || 'pdf',
    },
  });

  useEffect(() => {
    const fetchKits = async () => {
      const { data, error } = await supabase.from('kits').select('*').eq('is_active', true);
      if (error) {
        toast({
          title: 'Error fetching kits',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setKits(data);
      }
    };

    const fetchLanguages = async () => {
      const { data, error } = await supabase.from('languages').select('*');
      if (error) {
        toast({
          title: 'Error fetching languages',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setLanguages(data);
      }
    };

    fetchKits();
    fetchLanguages();
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let filePath = resource?.file_path;
      let thumbnailUrl = resource?.thumbnail_url;

      // Upload file if provided
      if (values.file) {
        const fileExt = values.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `resources/${values.resource_type}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('resources')
          .upload(filePath, values.file);

        if (uploadError) {
          throw new Error(`Error uploading file: ${uploadError.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('resources')
          .getPublicUrl(filePath);

        filePath = publicUrlData.publicUrl;
      }

      // Upload thumbnail if provided
      if (values.thumbnail) {
        const thumbnailExt = values.thumbnail.name.split('.').pop();
        const thumbnailName = `${Math.random().toString(36).substring(2, 15)}.${thumbnailExt}`;
        const thumbnailPath = `thumbnails/${thumbnailName}`;

        const { error: thumbnailError } = await supabase.storage
          .from('resources')
          .upload(thumbnailPath, values.thumbnail);

        if (thumbnailError) {
          throw new Error(`Error uploading thumbnail: ${thumbnailError.message}`);
        }

        // Get public URL
        const { data: thumbnailUrlData } = supabase.storage
          .from('resources')
          .getPublicUrl(thumbnailPath);

        thumbnailUrl = thumbnailUrlData.publicUrl;
      }

      const resourceData = {
        title: values.title,
        description: values.description || null,
        kit_id: values.kit_id,
        language_id: values.language_id,
        resource_type: values.resource_type,
        file_path: filePath,
        thumbnail_url: thumbnailUrl,
        is_active: true,
      };

      let result;
      if (resource) {
        // Update existing resource
        result = await supabase
          .from('resources')
          .update(resourceData)
          .eq('id', resource.id)
          .select();
      } else {
        // Create new resource
        result = await supabase
          .from('resources')
          .insert(resourceData)
          .select();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: resource ? 'Resource updated' : 'Resource created',
        description: `Successfully ${resource ? 'updated' : 'created'} resource: ${values.title}`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('file', file);
      
      // Create preview for PDF
      if (file.type === 'application/pdf') {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('thumbnail', file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{resource ? 'Edit Resource' : 'Create New Resource'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resource title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter resource description" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kit_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kit</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a kit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kits.length > 0 ? (
                          kits.map((kit) => (
                            <SelectItem key={kit.id} value={kit.id}>
                              {kit.title}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-kits">No kits available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.length > 0 ? (
                          languages.map((language) => (
                            <SelectItem key={language.id} value={language.id}>
                              {language.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-languages">No languages available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="resource_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  onChange={handleFileChange}
                  accept={
                    form.watch('resource_type') === 'pdf' 
                      ? '.pdf' 
                      : form.watch('resource_type') === 'video'
                      ? '.mp4,.webm,.ogg'
                      : '.mp3,.wav,.ogg'
                  }
                />
              </FormControl>
              {resource && !form.watch('file') && (
                <p className="text-sm text-gray-500">
                  Current file: {resource.file_path.split('/').pop()}
                </p>
              )}
              <FormMessage />
            </FormItem>

            <FormItem>
              <FormLabel>Thumbnail</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  onChange={handleThumbnailChange}
                  accept="image/*"
                />
              </FormControl>
              {thumbnailPreview && (
                <div className="mt-2">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-32 h-32 object-cover rounded-md"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>

            <CardFooter className="flex justify-end px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : resource ? 'Update Resource' : 'Create Resource'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResourceForm;