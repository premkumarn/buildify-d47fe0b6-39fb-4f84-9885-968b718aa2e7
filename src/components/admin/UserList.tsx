
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile } from '@/types';

const UserList: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'student' | 'teacher' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Role updated',
        description: `User role has been updated to ${role}`,
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
    } catch (error: any) {
      toast({
        title: 'Error updating role',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: isActive ? 'User activated' : 'User deactivated',
        description: `User has been ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));
    } catch (error: any) {
      toast({
        title: 'Error updating user status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleViewUserAccess = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-4">Loading users...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{user.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.role || 'student'}
                        onValueChange={(value: 'student' | 'teacher' | 'admin') => 
                          updateUserRole(user.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{user.school || 'N/A'}</TableCell>
                    <TableCell>{user.grade || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "success" : "destructive"}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewUserAccess(user)}
                        >
                          View Access
                        </Button>
                        <Button 
                          variant={user.is_active ? "destructive" : "outline"} 
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, !user.is_active)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                User Access - {selectedUser?.full_name || selectedUser?.id}
              </DialogTitle>
            </DialogHeader>
            <UserAccessList userId={selectedUser?.id || ''} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

interface UserAccessListProps {
  userId: string;
}

const UserAccessList: React.FC<UserAccessListProps> = ({ userId }) => {
  const { toast } = useToast();
  const [userAccess, setUserAccess] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserAccess();
    }
  }, [userId]);

  const fetchUserAccess = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_kit_access')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      setUserAccess(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching user access',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {loading ? (
        <div className="flex justify-center p-4">Loading access data...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kit</TableHead>
              <TableHead>Access Type</TableHead>
              <TableHead>PDF</TableHead>
              <TableHead>Video</TableHead>
              <TableHead>Audio</TableHead>
              <TableHead>Valid Until</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userAccess.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No access records found
                </TableCell>
              </TableRow>
            ) : (
              userAccess.map((access) => (
                <TableRow key={access.kit_id}>
                  <TableCell>{access.kit_title}</TableCell>
                  <TableCell>
                    <Badge variant={
                      access.access_type === 'paid' ? 'default' : 
                      access.access_type === 'free' ? 'secondary' : 
                      'outline'
                    }>
                      {access.access_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{access.can_access_pdf ? '✅' : '❌'}</TableCell>
                  <TableCell>{access.can_access_video ? '✅' : '❌'}</TableCell>
                  <TableCell>{access.can_access_audio ? '✅' : '❌'}</TableCell>
                  <TableCell>
                    {access.valid_until 
                      ? new Date(access.valid_until).toLocaleDateString() 
                      : 'Unlimited'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default UserList;