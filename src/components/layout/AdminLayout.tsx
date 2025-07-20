
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Home, Package, FileText, Users, Tag, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Admin Access Required</h1>
        <p className="mt-2 text-gray-600">You need administrator privileges to view this page.</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { path: '/admin/kits', label: 'Manage Kits', icon: Package },
    { path: '/admin/resources', label: 'Manage Resources', icon: FileText },
    { path: '/admin/users', label: 'Manage Users', icon: Users },
    { path: '/admin/promo-codes', label: 'Promo Codes', icon: Tag },
    { path: '/admin/settings', label: 'Company Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors",
                  location.pathname === item.path && "bg-gray-800 text-white"
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-800">
                {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
              </h1>
              <div className="flex items-center">
                <span className="mr-4 text-sm text-gray-600">
                  {profile?.full_name || user.email}
                </span>
                <Link to="/" className="text-blue-600 hover:underline">
                  Back to Site
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;