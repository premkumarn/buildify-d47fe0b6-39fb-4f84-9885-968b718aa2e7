
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-xl font-semibold text-blue-700">EdTech Science Kits</Link>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-700 hover:text-blue-600 transition-colors">Home</Link>
          {user && (
            <>
              <Link to="/resources" className="text-gray-700 hover:text-blue-600 transition-colors">Resources</Link>
              {user.user_metadata?.role === 'admin' && (
                <Link to="/admin/resources" className="text-gray-700 hover:text-blue-600 transition-colors">Manage Resources</Link>
              )}
            </>
          )}
        </nav>
        
        <div className="flex items-center">
          {user ? (
            <>
              <span className="mr-4 text-sm text-gray-600">
                Hello, {user.user_metadata?.full_name || user.email}
              </span>
              <Button variant="outline" onClick={handleSignOut} className="mr-2">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="mr-2" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button 
                className="px-8 rounded-md bg-gradient-to-br from-blue-700 to-blue-900 text-white hover:from-blue-600 hover:to-blue-800 transition-colors"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
