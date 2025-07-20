
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CompanySettings } from '@/types';

const formSchema = z.object({
  company_name: z.string().min(2, { message: 'Company name must be at least 2 characters' }),
  product_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logo: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CompanySettingsForm: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: '',
      product_name: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      website: '',
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        toast({
          title: 'Error fetching company settings',
          description: error.message,
          variant: 'destructive',
        });
      } else if (data) {
        setSettings(data);
        form.reset({
          company_name: data.company_name,
          product_name: data.product_name || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          address: data.address || '',
          website: data.website || '',
        });
        
        if (data.logo_url) {
          setLogoPreview(data.logo_url);
        }
      }
    };

    fetchSettings();
  }, [toast, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('logo', file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      let logoUrl = settings?.logo_url;

      // Upload logo if provided
      if (values.logo) {
        const fileExt = values.logo.name.split('.').pop();
        const fileName = `company-logo.${fileExt}`;
        const filePath = `company/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('settings')
          .upload(filePath, values.logo, { upsert: true });

        if (uploadError) {
          throw new Error(`Error uploading logo: ${uploadError.message}`);
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('settings')
          .getPublicUrl(filePath);

        logoUrl = publicUrlData.publicUrl;
      }

      const settingsData = {
        company_name: values.company_name,
        product_name: values.product_name || null,
        contact_email: values.contact_email || null,
        contact_phone: values.contact_phone || null,
        address: values.address || null,
        website: values.website || null,
        logo_url: logoUrl,
      };

      let result;
      if (settings) {
        // Update existing settings
        result = await supabase
          .from('company_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select();
      } else {
        // Create new settings
        result = await supabase
          .from('company_settings')
          .insert(settingsData)
          .select();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      setSettings(result.data[0]);

      toast({
        title: 'Settings updated',
        description: 'Company settings have been updated successfully',
      });
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

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Company Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="product_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your product or service
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter website URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter company address" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Company Logo</FormLabel>
              <FormControl>
                <Input 
                  type="file" 
                  onChange={handleLogoChange}
                  accept="image/*"
                />
              </FormControl>
              {logoPreview && (
                <div className="mt-2">
                  <img 
                    src={logoPreview} 
                    alt="Company logo preview" 
                    className="h-16 object-contain"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>

            <CardFooter className="flex justify-end px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CompanySettingsForm;