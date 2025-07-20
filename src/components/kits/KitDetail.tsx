
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, getPublicUrl } from '@/lib/supabase';
import { Kit, Resource, UserAccess, Language } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Package, FileText, Video, Music, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ResourceList from '@/components/resources/ResourceList';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KitDetailProps {
  kitId?: string;
}

const KitDetail: React.FC<KitDetailProps> = ({ kitId: propKitId }) => {
  const { kitId: paramKitId } = useParams<{ kitId: string }>();
  const kitId = propKitId || paramKitId;
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [kit, setKit] = useState<Kit | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Payment dialog state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Promo code dialog state
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  
  // Selected language for filtering resources
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  useEffect(() => {
    const fetchKitDetails = async () => {
      if (!kitId) return;
      
      try {
        setLoading(true);
        
        // Fetch kit details
        const { data: kitData, error: kitError } = await supabase
          .from('kits')
          .select('*')
          .eq('id', kitId)
          .eq('is_active', true)
          .single();
        
        if (kitError) throw kitError;
        
        // Fetch resources for this kit
        const { data: resourcesData, error: resourcesError } = await supabase
          .from('resources')
          .select(`
            *,
            languages (*)
          `)
          .eq('kit_id', kitId)
          .eq('is_active', true);
        
        if (resourcesError) throw resourcesError;
        
        // Fetch languages
        const { data: languagesData, error: languagesError } = await supabase
          .from('languages')
          .select('*');
        
        if (languagesError) throw languagesError;
        
        // If user is logged in, check if they have access to this kit
        if (user) {
          const { data: accessData, error: accessError } = await supabase
            .from('user_access')
            .select('*')
            .eq('user_id', user.id)
            .eq('kit_id', kitId)
            .maybeSingle();
          
          if (accessError) throw accessError;
          
          setUserAccess(accessData as UserAccess);
        }
        
        setKit(kitData as Kit);
        setResources(resourcesData as Resource[]);
        setLanguages(languagesData as Language[]);
        
        // Set default selected language if resources exist
        if (resourcesData.length > 0) {
          const uniqueLanguages = [...new Set(resourcesData.map(r => r.language_id))];
          if (uniqueLanguages.length > 0) {
            setSelectedLanguage(uniqueLanguages[0]);
          }
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchKitDetails();
  }, [kitId, user]);

  const handlePayment = async () => {
    if (!user || !kit) return;
    
    setPaymentLoading(true);
    setPaymentError(null);
    
    try {
      // In a real app, you would integrate with Stripe/Razorpay here
      // For this demo, we'll simulate a payment and call our edge function
      
      const paymentInfo = {
        userId: user.id,
        kitId: kit.id,
        paymentMethod,
        paymentId: `demo_${Date.now()}`,
        amount: 999, // Example price in cents/paisa
      };
      
      const response = await fetch(
        'https://enrtqetoosfvjxaijoje.supabase.co/functions/v1/e1d62c26-4b55-48c3-a5ae-331e87cc0dde',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
          },
          body: JSON.stringify(paymentInfo),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process payment');
      }
      
      // Refresh user access
      const { data: accessData } = await supabase
        .from('user_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('kit_id', kit.id)
        .single();
      
      setUserAccess(accessData as UserAccess);
      setPaymentOpen(false);
    } catch (error: any) {
      setPaymentError(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePromoCode = async () => {
    if (!user || !kit || !promoCode) return;
    
    setPromoLoading(true);
    setPromoError(null);
    
    try {
      const response = await fetch(
        'https://enrtqetoosfvjxaijoje.supabase.co/functions/v1/7a1e8623-7e16-496b-b1d4-a71bbacfb4eb',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
          },
          body: JSON.stringify({
            userId: user.id,
            promoCode,
          }),
        }
      );
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to redeem promo code');
      }
      
      // Refresh user access
      const { data: accessData } = await supabase
        .from('user_access')
        .select('*')
        .eq('user_id', user.id)
        .eq('kit_id', kit.id)
        .maybeSingle();
      
      setUserAccess(accessData as UserAccess);
      setPromoOpen(false);
    } catch (error: any) {
      setPromoError(error.message);
    } finally {
      setPromoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !kit) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || 'Kit not found'}</AlertDescription>
      </Alert>
    );
  }

  // Filter resources by selected language
  const filteredResources = selectedLanguage
    ? resources.filter(r => r.language_id === selectedLanguage)
    : resources;

  // Group resources by type
  const pdfResources = filteredResources.filter(r => r.resource_type === 'pdf');
  const videoResources = filteredResources.filter(r => r.resource_type === 'video');
  const audioResources = filteredResources.filter(r => r.resource_type === 'audio');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <div className="aspect-video w-full bg-gray-100 rounded-t-lg overflow-hidden">
              {kit.thumbnail_url ? (
                <img 
                  src={getPublicUrl('kits', kit.thumbnail_url)}
                  alt={kit.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{kit.title}</CardTitle>
                <Badge>Grade {kit.grade}</Badge>
              </div>
              <CardDescription>
                Physics Kit
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {kit.description && (
                <p className="text-sm text-gray-600">{kit.description}</p>
              )}
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Access Status</h4>
                
                {userAccess ? (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">
                        {userAccess.access_type.toUpperCase()}
                      </Badge>
                      {userAccess.valid_until && (
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            Expires: {new Date(userAccess.valid_until).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>PDFs:</span>
                        {userAccess.can_access_pdf ? (
                          <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 ml-1 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <Video className="h-4 w-4 mr-1" />
                        <span>Videos:</span>
                        {userAccess.can_access_video ? (
                          <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 ml-1 text-red-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center">
                        <Music className="h-4 w-4 mr-1" />
                        <span>Audio:</span>
                        {userAccess.can_access_audio ? (
                          <CheckCircle className="h-4 w-4 ml-1 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 ml-1 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ) : user ? (
                  <div className="space-y-4">
                    <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You don't have access to this kit yet.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full">Purchase Access</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Purchase Kit Access</DialogTitle>
                            <DialogDescription>
                              Get full access to "{kit.title}" for 1 year.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {paymentError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{paymentError}</AlertDescription>
                            </Alert>
                          )}
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="payment-method">Payment Method</Label>
                              <Select
                                value={paymentMethod}
                                onValueChange={setPaymentMethod}
                              >
                                <SelectTrigger id="payment-method">
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                                  <SelectItem value="upi">UPI</SelectItem>
                                  <SelectItem value="netbanking">Net Banking</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Price</Label>
                              <div className="text-2xl font-bold">₹999</div>
                              <p className="text-sm text-gray-500">
                                Includes access to all PDFs, videos, and audio guides for 1 year.
                              </p>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setPaymentOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handlePayment} disabled={paymentLoading}>
                              {paymentLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                'Complete Purchase'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            Redeem Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Redeem Promo Code</DialogTitle>
                            <DialogDescription>
                              Enter your promo code to get access to this kit.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {promoError && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{promoError}</AlertDescription>
                            </Alert>
                          )}
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="promo-code">Promo Code</Label>
                              <Input
                                id="promo-code"
                                placeholder="Enter your code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setPromoOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handlePromoCode} disabled={promoLoading || !promoCode}>
                              {promoLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Redeeming...
                                </>
                              ) : (
                                'Redeem Code'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please log in to access this kit.
                      </AlertDescription>
                    </Alert>
                    
                    <Button className="w-full" onClick={() => navigate('/login')}>
                      Log In to Access
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Kit Resources</CardTitle>
                
                {languages.length > 0 && (
                  <Select
                    value={selectedLanguage || ''}
                    onValueChange={(value) => setSelectedLanguage(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.id} value={language.id}>
                          {language.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <CardDescription>
                {filteredResources.length} resources available
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {filteredResources.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No resources available for this kit</p>
                </div>
              ) : (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All ({filteredResources.length})</TabsTrigger>
                    <TabsTrigger value="pdf">PDFs ({pdfResources.length})</TabsTrigger>
                    <TabsTrigger value="video">Videos ({videoResources.length})</TabsTrigger>
                    <TabsTrigger value="audio">Audio ({audioResources.length})</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pdf" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {pdfResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="video" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videoResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="audio" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {audioResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource} />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KitDetail;