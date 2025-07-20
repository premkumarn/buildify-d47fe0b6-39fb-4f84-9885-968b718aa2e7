
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
import KitForm from '@/components/admin/KitForm';
import { Kit } from '@/types';

const ManageKits: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);

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
    fetchKits();
  }, [user, navigate, toast]);

  const fetchKits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kits')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKits(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching kits',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKit = () => {
    setSelectedKit(null);
    setIsDialogOpen(true);
  };

  const handleEditKit = (kit: Kit) => {
    setSelectedKit(kit);
    setIsDialogOpen(true);
  };

  const handleToggleKitStatus = async (kit: Kit) => {
    try {
      const { error } = await supabase
        .from('kits')
        .update({ is_active: !kit.is_active })
        .eq('id', kit.id);

      if (error) throw error;

      toast({
        title: kit.is_active ? 'Kit deactivated' : 'Kit activated',
        description: `${kit.title} has been ${kit.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      // Update local state
      setKits(kits.map(k => 
        k.id === kit.id ? { ...k, is_active: !kit.is_active } : k
      ));
    } catch (error: any) {
      toast({
        title: 'Error updating kit status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    fetchKits();
  };

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Kits</h1>
          <Button onClick={handleCreateKit}>Create New Kit</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Kits</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading kits...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kits.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No kits found
                      </TableCell>
                    </TableRow>
                  ) : (
                    kits.map((kit) => (
                      <TableRow key={kit.id}>
                        <TableCell>
                          <div className="font-medium">{kit.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {kit.description || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Grade {kit.grade}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={kit.is_active ? "success" : "destructive"}>
                            {kit.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(kit.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditKit(kit)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant={kit.is_active ? "destructive" : "outline"} 
                              size="sm"
                              onClick={() => handleToggleKitStatus(kit)}
                            >
                              {kit.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
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
                {selectedKit ? 'Edit Kit' : 'Create New Kit'}
              </DialogTitle>
            </DialogHeader>
            <KitForm kit={selectedKit} onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ManageKits;