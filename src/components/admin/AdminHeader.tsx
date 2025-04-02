
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/services/dataService';
import { Link } from 'react-router-dom';

const AdminHeader: React.FC = () => {
  const { logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-navy-900">
            Portfolio Admin
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" target="_blank">
            <Button variant="outline" size="sm">
              View Site
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
