import React from 'react';
import { useAuth } from '../services/dataService';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

export default function Admin() {
  const { authenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {authenticated ? <AdminDashboard /> : <AdminLogin />}
    </div>
  );
}