
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import PromoCodeForm from '@/components/admin/PromoCodeForm';

const ManagePromoCodes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<any | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkAdminRole = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data.role !== 'admin') {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    checkAdminRole();
    fetchPromoCodes();
  }, [user, navigate, toast]);

  const fetchPromoCodes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*, kits(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching promo codes',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromoCode = () => {
    setSelectedPromoCode(null);
    setIsDialogOpen(true);
  };

  const handleEditPromoCode = (promoCode: any) => {
    setSelectedPromoCode(promoCode);
    setIsDialogOpen(true);
  };

  const handleDeletePromoCode = async (promoCode: any) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', promoCode.id);

      if (error) throw error;

      toast({
        title: 'Promo code deleted',
        description: `Promo code ${promoCode.code} has been deleted successfully`,
      });

      // Update local state
      setPromoCodes(promoCodes.filter(p => p.id !== promoCode.id));
    } catch (error: any) {
      toast({
        title: 'Error deleting promo code',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchPromoCodes();
  };

  const isPromoCodeActive = (promoCode: any) => {
    const now = new Date();
    const validFrom = promoCode.valid_from ? new Date(promoCode.valid_from) : null;
    const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null;
    
    if (validFrom && validFrom > now) return false;
    if (validUntil && validUntil < now) return false;
    if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) return false;
    
    return true;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Promo Codes</h1>
          <Button onClick={handleCreatePromoCode}>Create New Promo Code</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Promo Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading promo codes...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Kit</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No promo codes found
                      </TableCell>
                    </TableRow>
                  ) : (
                    promoCodes.map((promoCode) => {
                      const isActive = isPromoCodeActive(promoCode);
                      
                      return (
                        <TableRow key={promoCode.id}>
                          <TableCell>
                            <div className="font-medium">{promoCode.code}</div>
                            <div className="text-sm text-gray-500">
                              {promoCode.description || 'No description'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {promoCode.is_all_kits ? (
                              <Badge variant="secondary">All Kits</Badge>
                            ) : (
                              promoCode.kits?.title || 'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {promoCode.current_uses || 0} / {promoCode.max_uses || '∞'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {promoCode.valid_from 
                                ? new Date(promoCode.valid_from).toLocaleDateString() 
                                : 'Any time'} 
                              {' to '}
                              {promoCode.valid_until 
                                ? new Date(promoCode.valid_until).toLocaleDateString() 
                                : 'No expiry'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={isActive ? "success" : "destructive"}>
                              {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditPromoCode(promoCode)}
                              >
                                Edit
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeletePromoCode(promoCode)}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedPromoCode ? 'Edit Promo Code' : 'Create New Promo Code'}
              </DialogTitle>
            </DialogHeader>
            <PromoCodeForm promoCode={selectedPromoCode} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ManagePromoCodes;