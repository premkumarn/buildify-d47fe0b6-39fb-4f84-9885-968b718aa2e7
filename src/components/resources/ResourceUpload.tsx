
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { ResourceType, Kit, Language } from '@/types';
import { toast } from 'sonner';

interface ResourceUploadProps {
  onSuccess?: () => void;
}

interface FormValues {
  title: string;
  description: string;
  kit_id: string;
  language_id: string;
  resource_type: ResourceType;
}

const ResourceUpload: React.FC<ResourceUploadProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [kits, setKits] = useState<Kit[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      kit_id: '',
      language_id: '',
      resource_type: 'pdf',
    }
  });
  
  const resourceType = watch('resource_type');

  useEffect(() => {
    // Fetch kits
    const fetchKits = async () => {
      const { data, error } = await supabase
        .from('kits')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        toast.error('Failed to fetch kits');
        console.error('Error fetching kits:', error);
        return;
      }
      
      setKits(data || []);
    };
    
    // Fetch languages
    const fetchLanguages = async () => {
      const { data, error } = await supabase
        .from('languages')
        .select('*');
      
      if (error) {
        toast.error('Failed to fetch languages');
        console.error('Error fetching languages:', error);
        return;
      }
      
      setLanguages(data || []);
    };
    
    fetchKits();
    fetchLanguages();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    
    try {
      // 1. Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `resources/${data.resource_type}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);
      
      // 3. Create resource record in database
      const { error: dbError } = await supabase
        .from('resources')
        .insert({
          title: data.title,
          description: data.description,
          kit_id: data.kit_id,
          language_id: data.language_id,
          resource_type: data.resource_type,
          file_path: publicUrlData.publicUrl,
          file_size: file.size,
          is_active: true,
        });
      
      if (dbError) {
        throw dbError;
      }
      
      toast.success('Resource uploaded successfully');
      reset();
      setFile(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
      console.error('Error uploading resource:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Resource</CardTitle>
        <CardDescription>
          Upload PDF documents, videos, or audio files for your science kits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter resource title"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter resource description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="kit">Science Kit</Label>
            <Select
              onValueChange={(value) => setValue('kit_id', value)}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a science kit" />
              </SelectTrigger>
              <SelectContent>
                {kits.map((kit) => (
                  <SelectItem key={kit.id} value={kit.id}>
                    {kit.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.kit_id && (
              <p className="text-sm text-red-500">{errors.kit_id.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              onValueChange={(value) => setValue('language_id', value)}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.id} value={language.id}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language_id && (
              <p className="text-sm text-red-500">{errors.language_id.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="resource_type">Resource Type</Label>
            <Select
              onValueChange={(value) => setValue('resource_type', value as ResourceType)}
              defaultValue="pdf"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF Document</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="file">
              {resourceType === 'pdf' && 'Upload PDF'}
              {resourceType === 'video' && 'Upload Video'}
              {resourceType === 'audio' && 'Upload Audio'}
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept={
                resourceType === 'pdf' ? '.pdf' :
                resourceType === 'video' ? '.mp4,.webm,.mov' :
                '.mp3,.wav,.ogg'
              }
            />
            {file && (
              <p className="text-sm text-gray-500">
                Selected file: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Resource'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResourceUpload;