
import React, { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { usePortfolioData, Experience, generateId } from '@/services/dataService';
import { format } from 'date-fns';
import { Edit, Trash } from 'lucide-react';

const AdminExperience: React.FC = () => {
  const [experiences, setExperiences] = usePortfolioData<Experience[]>('experience');
  const [isEditing, setIsEditing] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience>({
    id: '',
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    technologies: []
  });
  const [techInput, setTechInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null);

  const resetForm = () => {
    setCurrentExperience({
      id: '',
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      technologies: []
    });
    setTechInput('');
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentExperience(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckbox = (checked: boolean) => {
    setCurrentExperience(prev => ({
      ...prev,
      current: checked,
      endDate: checked ? '' : prev.endDate
    }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !currentExperience.technologies.includes(techInput.trim())) {
      setCurrentExperience(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setCurrentExperience(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleEdit = (exp: Experience) => {
    setCurrentExperience({...exp});
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setExperienceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (experienceToDelete) {
      setExperiences(experiences.filter(exp => exp.id !== experienceToDelete));
      setDeleteDialogOpen(false);
      setExperienceToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      ...currentExperience,
      id: currentExperience.id || generateId()
    };
    
    if (isEditing) {
      setExperiences(experiences.map(exp => 
        exp.id === formData.id ? formData : exp
      ));
    } else {
      setExperiences([...experiences, formData]);
    }
    
    resetForm();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Experience</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Add Experience
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{currentExperience.id ? 'Edit' : 'Add'} Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <Input
                    id="company"
                    name="company"
                    value={currentExperience.company}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <Input
                    id="position"
                    name="position"
                    value={currentExperience.position}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formatDate(currentExperience.startDate)}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formatDate(currentExperience.endDate)}
                    onChange={handleChange}
                    disabled={currentExperience.current}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="current" 
                  checked={currentExperience.current} 
                  onCheckedChange={handleCheckbox}
                />
                <label 
                  htmlFor="current"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Current Position
                </label>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentExperience.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Technologies
                </label>
                <div className="flex space-x-2 mb-2">
                  <Input
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    placeholder="Add technology"
                  />
                  <Button type="button" onClick={addTechnology} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentExperience.technologies.map((tech, index) => (
                    <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded-md">
                      <span className="mr-2">{tech}</span>
                      <button 
                        type="button" 
                        onClick={() => removeTechnology(tech)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {currentExperience.id ? 'Update' : 'Add'} Experience
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Experience List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiences.length > 0 ? (
                  experiences.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell>{exp.company}</TableCell>
                      <TableCell>{exp.position}</TableCell>
                      <TableCell>
                        {formatDate(exp.startDate).split('-').reverse().join('/')} - {exp.current ? 'Present' : formatDate(exp.endDate).split('-').reverse().join('/')}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(exp)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No experiences found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the experience entry.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExperience;
