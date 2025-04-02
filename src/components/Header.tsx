
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/services/dataService';

const Header: React.FC = () => {
  const { authenticated, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/" className="font-bold text-xl text-navy-900">
          Vishal<span className="text-primary">.dev</span>
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-navy-700 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/about" className="text-navy-700 hover:text-primary transition-colors">
            About
          </Link>
          <Link to="/projects" className="text-navy-700 hover:text-primary transition-colors">
            Projects
          </Link>
          <Link to="/contact" className="text-navy-700 hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        <div>
          {authenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Admin
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
