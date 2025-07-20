
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Kit } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  description: z.string().optional(),
  grade: z.enum(['6', '7', '8', '9', '10'], { 
    required_error: 'Please select a grade' 
  }),
  is_active: z.boolean().default(true),
  thumbnail: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface KitFormProps {
  kit?: Kit;
  onSuccess?: () => void;
}

const KitForm: React.FC<KitFormProps> = ({ kit, onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: kit?.title || '',
      description: kit?.description || '',
      grade: kit?.grade || '6',
      is_active: kit?.is_active !== false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Upload thumbnail if provided
      let thumbnailPath = kit?.thumbnail_url || null;
      if (data.thumbnail) {
        const thumbExt = data.thumbnail.name.split('.').pop();
        thumbnailPath = `thumbnails/${Date.now()}.${thumbExt}`;
        
        const { error: thumbError } = await supabase.storage
          .from('kits')
          .upload(thumbnailPath, data.thumbnail);
        
        if (thumbError) throw thumbError;
      }
      
      // Create or update kit record in database
      if (kit) {
        // Update existing kit
        const { error: kitError } = await supabase
          .from('kits')
          .update({
            title: data.title,
            description: data.description || null,
            grade: data.grade,
            thumbnail_url: thumbnailPath,
            is_active: data.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', kit.id);
        
        if (kitError) throw kitError;
        
        setSuccess('Kit updated successfully');
      } else {
        // Create new kit
        const { error: kitError } = await supabase
          .from('kits')
          .insert({
            title: data.title,
            description: data.description || null,
            grade: data.grade,
            thumbnail_url: thumbnailPath,
            is_active: data.is_active,
          });
        
        if (kitError) throw kitError;
        
        setSuccess('Kit created successfully');
        form.reset({
          title: '',
          description: '',
          grade: '6',
          is_active: true,
        });
      }
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

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
                    <Input placeholder="Kit title" {...field} />
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
                      placeholder="Describe this kit" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="6">Grade 6</SelectItem>
                      <SelectItem value="7">Grade 7</SelectItem>
                      <SelectItem value="8">Grade 8</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="10">Grade 10</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Make this kit visible to users
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field: { value, onChange, ...fieldProps } }) => (
                <FormItem>
                  <FormLabel>Thumbnail Image</FormLabel>
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
                  {kit?.thumbnail_url && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Current thumbnail:</p>
                      <img 
                        src={getPublicUrl('kits', kit.thumbnail_url)}
                        alt="Current thumbnail"
                        className="mt-1 h-20 rounded-md object-cover"
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {kit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                kit ? 'Update Kit' : 'Create Kit'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default KitForm;