
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Resource } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResourceUpload from '@/components/resources/ResourceUpload';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FileText, Video, Music, Edit, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const ManageResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is admin
    if (user && user.user_metadata?.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      navigate('/');
      return;
    }
    
    fetchResources();
  }, [user, navigate]);
  
  const fetchResources = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setResources(data || []);
    } catch (error: any) {
      toast.error(`Error fetching resources: ${error.message}`);
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleToggleActive = async (resource: Resource) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_active: !resource.is_active })
        .eq('id', resource.id);
      
      if (error) {
        throw error;
      }
      
      toast.success(`Resource ${resource.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchResources();
    } catch (error: any) {
      toast.error(`Error updating resource: ${error.message}`);
      console.error('Error updating resource:', error);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Resource deleted successfully');
      fetchResources();
    } catch (error: any) {
      toast.error(`Error deleting resource: ${error.message}`);
      console.error('Error deleting resource:', error);
    }
  };
  
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-600" />;
      case 'audio':
        return <Music className="h-5 w-5 text-purple-600" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Resources</h1>
      
      <Tabs defaultValue="list">
        <TabsList className="mb-6">
          <TabsTrigger value="list">Resource List</TabsTrigger>
          <TabsTrigger value="upload">Upload New Resource</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading resources...</div>
              ) : resources.length === 0 ? (
                <div className="text-center py-4">
                  No resources found. Upload your first resource!
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resources.map((resource) => (
                      <TableRow key={resource.id}>
                        <TableCell className="font-medium">{resource.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getResourceTypeIcon(resource.resource_type)}
                            <span className="ml-2 capitalize">{resource.resource_type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            resource.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {resource.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(resource.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => navigate(`/resources/${resource.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={resource.is_active ? "destructive" : "outline"}
                              size="icon"
                              onClick={() => handleToggleActive(resource)}
                            >
                              {resource.is_active ? (
                                <Trash2 className="h-4 w-4" />
                              ) : (
                                <Edit className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(resource.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <ResourceUpload onSuccess={fetchResources} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageResources;