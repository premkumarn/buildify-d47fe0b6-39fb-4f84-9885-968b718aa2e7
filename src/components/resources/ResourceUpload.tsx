
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResourceType, Kit, Language } from '@/types';
import { formatFileSize } from '@/lib/supabase';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  description: z.string().optional(),
  kit_id: z.string().uuid({ message: 'Please select a kit' }),
  language_id: z.string().uuid({ message: 'Please select a language' }),
  resource_type: z.enum(['pdf', 'video', 'audio'], { 
    required_error: 'Please select a resource type' 
  }),
  file: z.instanceof(File).refine(
    (file) => file.size <= MAX_FILE_SIZE,
    `File size should be less than ${formatFileSize(MAX_FILE_SIZE)}`
  ),
  thumbnail: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ResourceUploadProps {
  onSuccess?: () => void;
}

const ResourceUpload: React.FC<ResourceUploadProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [kits, setKits] = useState<Kit[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      resource_type: 'pdf',
    },
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch kits
        const { data: kitsData, error: kitsError } = await supabase
          .from('kits')
          .select('*')
          .eq('is_active', true);
        
        if (kitsError) throw kitsError;
        
        // Fetch languages
        const { data: languagesData, error: languagesError } = await supabase
          .from('languages')
          .select('*');
        
        if (languagesError) throw languagesError;
        
        setKits(kitsData as Kit[]);
        setLanguages(languagesData as Language[]);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, []);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 1. Upload the file to storage
      const fileExt = data.file.name.split('.').pop();
      const filePath = `${data.resource_type}/${data.kit_id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, data.file);
      
      if (uploadError) throw uploadError;
      
      // 2. Upload thumbnail if provided
      let thumbnailPath = null;
      if (data.thumbnail) {
        const thumbExt = data.thumbnail.name.split('.').pop();
        thumbnailPath = `thumbnails/${data.kit_id}/${Date.now()}.${thumbExt}`;
        
        const { error: thumbError } = await supabase.storage
          .from('resources')
          .upload(thumbnailPath, data.thumbnail);
        
        if (thumbError) throw thumbError;
      }
      
      // 3. Create resource record in database
      const { error: resourceError } = await supabase
        .from('resources')
        .insert({
          title: data.title,
          description: data.description || null,
          kit_id: data.kit_id,
          language_id: data.language_id,
          resource_type: data.resource_type,
          file_path: filePath,
          file_size: data.file.size,
          thumbnail_url: thumbnailPath,
          is_active: true,
        });
      
      if (resourceError) throw resourceError;
      
      setSuccess('Resource uploaded successfully');
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-500 text-green-700 bg-green-50">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Resource title" {...field} />
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
                      placeholder="Describe this resource" 
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
                    <FormLabel>Science Kit</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a kit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kits.map((kit) => (
                          <SelectItem key={kit.id} value={kit.id}>
                            {kit.title} (Grade {kit.grade})
                          </SelectItem>
                        ))}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.id} value={language.id}>
                            {language.name}
                          </SelectItem>
                        ))}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept={
                          form.watch('resource_type') === 'pdf' 
                            ? '.pdf' 
                            : form.watch('resource_type') === 'video'
                              ? '.mp4,.webm,.mov'
                              : '.mp3,.wav,.ogg'
                        }
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...fieldProps}
                      />
                      <Upload className="h-5 w-5 text-gray-500" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Thumbnail (Optional)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            onChange(file);
                          }
                        }}
                        {...fieldProps}
                      />
                      <Upload className="h-5 w-5 text-gray-500" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Resource'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResourceUpload;