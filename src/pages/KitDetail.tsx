
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ResourceList from '@/components/resources/ResourceList';
import { Kit, UserAccess } from '@/types';

const KitDetail: React.FC = () => {
  const { kitId } = useParams<{ kitId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kit, setKit] = useState<Kit | null>(null);
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!kitId) return;

    const fetchKitDetails = async () => {
      setLoading(true);
      try {
        // Fetch kit details
        const { data: kitData, error: kitError } = await supabase
          .from('kits')
          .select('*')
          .eq('id', kitId)
          .single();

        if (kitError) throw kitError;
        setKit(kitData);

        // Fetch user access if logged in
        if (user) {
          const { data: accessData, error: accessError } = await supabase
            .from('user_access')
            .select('*')
            .eq('user_id', user.id)
            .eq('kit_id', kitId)
            .single();

          if (!accessError) {
            setUserAccess(accessData);
          }
        }
      } catch (error: any) {
        toast({
          title: 'Error fetching kit details',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchKitDetails();
  }, [kitId, user, toast]);

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to purchase this kit',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!kit) return;

    setProcessingPayment(true);
    try {
      // In a real app, you would integrate with Stripe/Razorpay here
      // For this demo, we'll simulate a successful payment
      const paymentDetails = {
        userId: user.id,
        kitId: kit.id,
        paymentMethod: 'credit_card',
        paymentId: `demo_${Date.now()}`,
        amount: 999, // $9.99
      };

      const { data, error } = await supabase.functions.invoke('e1d62c26-4b55-48c3-a5ae-331e87cc0dde', {
        body: paymentDetails,
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Purchase Successful',
          description: 'You now have access to this kit',
        });
        
        // Update local state
        setUserAccess(data.access[0]);
      } else {
        throw new Error(data.message || 'Payment processing failed');
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Loading kit details...
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Kit Not Found</h1>
        <p className="mb-4">The kit you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const hasAccess = !!userAccess;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          ← Back to Kits
        </Button>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            {kit.thumbnail_url ? (
              <img 
                src={kit.thumbnail_url} 
                alt={kit.title} 
                className="w-full h-auto rounded-lg shadow-md"
              />
            ) : (
              <div className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            
            <div className="mt-4">
              <Badge>{`Grade ${kit.grade}`}</Badge>
            </div>
            
            {!hasAccess && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Get Access</CardTitle>
                  <CardDescription>
                    Purchase this kit to access all resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$9.99</p>
                  <p className="text-sm text-gray-500 mt-1">One-time purchase, lifetime access</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={handlePurchase}
                    disabled={processingPayment}
                  >
                    {processingPayment ? 'Processing...' : 'Purchase Now'}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {hasAccess && (
              <Card className="mt-6 bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">You Have Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700">
                    Access Type: <span className="font-medium">{userAccess?.access_type}</span>
                  </p>
                  {userAccess?.valid_until && (
                    <p className="text-sm text-green-600 mt-1">
                      Valid until: {new Date(userAccess.valid_until).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{kit.title}</h1>
            <p className="text-gray-600 mb-6">{kit.description}</p>
            
            <Tabs defaultValue="resources" className="w-full">
              <TabsList>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="resources" className="mt-6">
                <ResourceList kitId={kit.id} showAccessStatus />
              </TabsContent>
              
              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Grade Level</h3>
                        <p>{`Grade ${kit.grade}`}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">What's Included</h3>
                        <ul className="list-disc list-inside space-y-1 mt-2">
                          <li>Instructional manuals (PDF)</li>
                          <li>Explanatory videos</li>
                          <li>Audio guides</li>
                          <li>Multiple language support</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-medium">Learning Objectives</h3>
                        <p className="mt-2">
                          This physics kit is designed to help students understand fundamental 
                          physics concepts through hands-on experiments and comprehensive 
                          learning materials.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitDetail;