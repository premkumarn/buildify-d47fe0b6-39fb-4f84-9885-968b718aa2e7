
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';
import UserList from '@/components/admin/UserList';

const ManageUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
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
  }, [user, navigate, toast]);

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
        <UserList />
      </div>
    </AdminLayout>
  );
};

export default ManageUsers;