
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Kit } from '@/types';

const formSchema = z.object({
  code: z.string().min(3, { message: 'Code must be at least 3 characters' }),
  description: z.string().optional(),
  kit_id: z.string().uuid().optional().nullable(),
  is_all_kits: z.boolean().default(false),
  max_uses: z.number().int().positive().optional().nullable(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface PromoCodeFormProps {
  promoCode?: any;
  onSuccess?: () => void;
}

const PromoCodeForm: React.FC<PromoCodeFormProps> = ({ promoCode, onSuccess }) => {
  const { toast } = useToast();
  const [kits, setKits] = useState<Kit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: promoCode?.code || '',
      description: promoCode?.description || '',
      kit_id: promoCode?.kit_id || null,
      is_all_kits: promoCode?.is_all_kits || false,
      max_uses: promoCode?.max_uses || null,
      valid_from: promoCode?.valid_from 
        ? new Date(promoCode.valid_from).toISOString().split('T')[0] 
        : undefined,
      valid_until: promoCode?.valid_until 
        ? new Date(promoCode.valid_until).toISOString().split('T')[0] 
        : undefined,
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

    fetchKits();
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const promoData = {
        code: values.code,
        description: values.description || null,
        kit_id: values.is_all_kits ? null : values.kit_id,
        is_all_kits: values.is_all_kits,
        max_uses: values.max_uses,
        valid_from: values.valid_from ? new Date(values.valid_from).toISOString() : null,
        valid_until: values.valid_until ? new Date(values.valid_until).toISOString() : null,
      };

      let result;
      if (promoCode) {
        // Update existing promo code
        result = await supabase
          .from('promo_codes')
          .update(promoData)
          .eq('id', promoCode.id)
          .select();
      } else {
        // Create new promo code
        result = await supabase
          .from('promo_codes')
          .insert(promoData)
          .select();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: promoCode ? 'Promo code updated' : 'Promo code created',
        description: `Successfully ${promoCode ? 'updated' : 'created'} promo code: ${values.code}`,
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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{promoCode ? 'Edit Promo Code' : 'Create New Promo Code'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promo Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter promo code" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the code users will enter to redeem access
                  </FormDescription>
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
                      placeholder="Enter promo code description" 
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
              name="is_all_kits"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Apply to all kits</FormLabel>
                    <FormDescription>
                      When enabled, this promo code will grant access to all active kits
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

            {!form.watch('is_all_kits') && (
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
            )}

            <FormField
              control={form.control}
              name="max_uses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Uses</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Leave empty for unlimited uses" 
                      {...field} 
                      value={field.value === null ? '' : field.value}
                      onChange={e => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of times this code can be redeemed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="valid_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid From</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
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
                name="valid_until"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="flex justify-end px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : promoCode ? 'Update Promo Code' : 'Create Promo Code'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PromoCodeForm;