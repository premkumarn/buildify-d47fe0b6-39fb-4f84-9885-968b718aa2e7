
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/layout/AdminLayout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalKits: 0,
    totalResources: 0,
    activePromoCodes: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          description: 'You do not have permission to access the admin dashboard',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch counts
        const [
          { count: userCount }, 
          { count: kitCount }, 
          { count: resourceCount },
          { count: promoCount },
          { data: activityData }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('kits').select('*', { count: 'exact', head: true }),
          supabase.from('resources').select('*', { count: 'exact', head: true }),
          supabase.from('promo_codes')
            .select('*', { count: 'exact', head: true })
            .gt('valid_until', new Date().toISOString()),
          supabase.from('user_activity')
            .select('*, profiles(full_name), resources(title, resource_type)')
            .order('viewed_at', { ascending: false })
            .limit(10)
        ]);

        setStats({
          totalUsers: userCount || 0,
          totalKits: kitCount || 0,
          totalResources: resourceCount || 0,
          activePromoCodes: promoCount || 0,
        });

        setRecentActivity(activityData || []);
      } catch (error: any) {
        toast({
          title: 'Error fetching dashboard data',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
    fetchDashboardData();
  }, [user, navigate, toast]);

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Kits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalKits}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalResources}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Active Promo Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activePromoCodes}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="w-full">
          <TabsList>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>
                  The latest resource views from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Loading activity data...</div>
                ) : recentActivity.length === 0 ? (
                  <div className="text-center py-4">No recent activity found</div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start border-b pb-4">
                        <div className="flex-1">
                          <p className="font-medium">
                            {activity.profiles?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Viewed: {activity.resources?.title || 'Unknown Resource'}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 mr-2">
                              {activity.resources?.resource_type || 'unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.viewed_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm">
                          {activity.completed ? (
                            <span className="text-green-600">Completed</span>
                          ) : (
                            <span className="text-amber-600">In progress</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
                <CardDescription>
                  Key metrics and system health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">Storage Usage</h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full w-[45%]"></div>
                        </div>
                        <span className="ml-2 text-sm">45%</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        4.5 GB used of 10 GB
                      </p>
                    </div>
                    
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium mb-2">User Engagement</h3>
                      <p className="text-2xl font-bold">76%</p>
                      <p className="text-sm text-gray-500">
                        Average resource completion rate
                      </p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Popular Resources</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Introduction to Forces (PDF)</span>
                        <span className="text-gray-500">243 views</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Newton's Laws Explained (Video)</span>
                        <span className="text-gray-500">198 views</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Energy Conservation (Audio)</span>
                        <span className="text-gray-500">156 views</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;