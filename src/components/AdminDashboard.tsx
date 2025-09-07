import React, { useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../services/dataService';
import { LogOut, User, Database, Settings } from 'lucide-react';
import AdminProfile from './AdminProfile';
import DeviceSessionManager from './DeviceSessionManager';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile Management
            </TabsTrigger>
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Device & Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <AdminProfile />
          </TabsContent>

          <TabsContent value="devices">
            <DeviceSessionManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}