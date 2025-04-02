
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  usePortfolioData, 
  Project, 
  Experience,
  Skill 
} from '@/services/dataService';

const AdminDashboard: React.FC = () => {
  const [projects] = usePortfolioData<Project[]>('projects');
  const [experiences] = usePortfolioData<Experience[]>('experience');
  const [skills] = usePortfolioData<Skill[]>('skills');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projects.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{experiences.length}</p>
            <p className="text-sm text-gray-500 mt-1">Work experiences</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{skills.length}</p>
            <p className="text-sm text-gray-500 mt-1">Technical skills</p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/profile'}>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Update Profile</h3>
            <p className="text-sm text-gray-500">Edit your personal information</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = '/admin/projects'}>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Manage Projects</h3>
            <p className="text-sm text-gray-500">Add or edit your projects</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
