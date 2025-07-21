
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserAccess, UserActivity, Resource } from '@/types';
import { Loader2 } from 'lucide-react';
import KitList from '@/components/kits/KitList';
import MainLayout from '@/components/layout/MainLayout';

const Profile: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userAccess, setUserAccess] = useState<UserAccess[]>([]);
  const [recentActivity, setRecentActivity] = useState<(UserActivity & { resource: Resource })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch user access
        const { data: accessData, error: accessError } = await supabase
          .from('user_kit_access')
          .select('*')
          .eq('user_id', user.id);

        if (accessError) throw accessError;
        setUserAccess(accessData || []);

        // Fetch recent activity
        const { data: activityData, error: activityError } = await supabase
          .from('user_activity')
          .select(`
            *,
            resource:resources(*)
          `)
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(10);

        if (activityError) throw activityError;
        setRecentActivity(activityData || []);
      } catch (error: any) {
        toast({
          title: 'Error fetching user data',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, navigate, toast]);

  if (!user || !profile) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Button onClick={() => navigate('/login')}>Sign In to View Profile</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">
            Welcome back, {profile.full_name || user.email}
          </p>
        </div>

        <Tabs defaultValue="my-kits" className="w-full">
          <TabsList>
            <TabsTrigger value="my-kits">My Kits</TabsTrigger>
            <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-kits" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Science Kits</CardTitle>
                <CardDescription>
                  Kits you have access to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : userAccess.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-md">
                    <p className="text-gray-500 mb-4">You don't have access to any kits yet</p>
                    <Button onClick={() => navigate('/')}>Browse Available Kits</Button>
                  </div>
                ) : (
                  <KitList showOnlyAccessible={true} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent-activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent resource views
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start border-b pb-4">
                        <div className="flex-1">
                          <p className="font-medium">
                            {activity.resource?.title || 'Unknown Resource'}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 mr-2">
                              {activity.resource?.resource_type || 'unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.viewed_at || '').toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/resources/${activity.resource_id}`)}
                        >
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your personal details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p>{user.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p>{profile.full_name || 'Not provided'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Role</h3>
                    <p className="capitalize">{profile.role || 'Not specified'}</p>
                  </div>
                  
                  {profile.role === 'student' && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Grade</h3>
                      <p>{profile.grade ? `Grade ${profile.grade}` : 'Not specified'}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">School/Institution</h3>
                    <p>{profile.school || 'Not provided'}</p>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline">Edit Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Profile;