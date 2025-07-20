
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import KitList from '@/components/kits/KitList';
import { CompanySettings } from '@/types';

const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (!error && data) {
        setSettings(data);
      }
    };

    fetchSettings();
  }, []);

  const handleRedeemPromo = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to redeem a promo code',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!promoCode.trim()) {
      toast({
        title: 'Promo Code Required',
        description: 'Please enter a promo code',
        variant: 'destructive',
      });
      return;
    }

    setIsRedeeming(true);
    try {
      const { data, error } = await supabase.functions.invoke('7a1e8623-7e16-496b-b1d4-a71bbacfb4eb', {
        body: { promoCode: promoCode.trim() },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        setPromoCode('');
      } else {
        toast({
          title: 'Error',
          description: data.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to redeem promo code',
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          {settings?.product_name || 'Physics Explorer'} Science Kits
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Interactive physics kits with instructional materials for students in grades 6-10
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="col-span-1 md:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <Input
                  placeholder="Search kits by title, grade, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              {user ? (
                <Button onClick={() => navigate('/profile')} variant="outline">
                  My Resources
                </Button>
              ) : (
                <Button onClick={() => navigate('/login')}>
                  Sign In to Access
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Have a Promo Code?</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button 
                onClick={handleRedeemPromo} 
                disabled={isRedeeming || !promoCode.trim()}
              >
                {isRedeeming ? 'Redeeming...' : 'Redeem'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Available Science Kits</h2>
        <KitList searchQuery={searchQuery} />
      </div>

      <div className="bg-blue-50 rounded-lg p-8 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Why Choose Our Science Kits?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Comprehensive Learning</h3>
              <p className="text-gray-600">
                Each kit includes PDFs, videos, and audio guides in multiple languages
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Curriculum Aligned</h3>
              <p className="text-gray-600">
                Designed to complement school curriculum for grades 6-10
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-lg mb-2">Interactive Experience</h3>
              <p className="text-gray-600">
                Hands-on experiments with detailed explanations and guidance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;