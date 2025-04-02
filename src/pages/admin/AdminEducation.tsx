
import React, { useState } from 'react';
import { usePortfolioData, generateId, Education } from '@/services/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PencilIcon, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function AdminEducation() {
  const [education, setEducation] = usePortfolioData<Education[]>('education');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null);
  
  const initialEducation: Education = {
    id: '',
    institution: '',
    degree: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    grade: ''
  };

  const handleAddNew = () => {
    setCurrentEducation({
      ...initialEducation,
      id: generateId()
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (education: Education) => {
    setCurrentEducation(education);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedEducation = education.filter(edu => edu.id !== id);
    setEducation(updatedEducation);
    toast({
      title: 'Education deleted',
      description: 'The education entry has been removed successfully.'
    });
  };

  const handleSaveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentEducation) return;
    
    const isNewEducation = !education.some(edu => edu.id === currentEducation.id);
    let updatedEducation: Education[];
    
    if (isNewEducation) {
      updatedEducation = [...education, currentEducation];
    } else {
      updatedEducation = education.map(edu => 
        edu.id === currentEducation.id ? currentEducation : edu
      );
    }
    
    setEducation(updatedEducation);
    setIsDialogOpen(false);
    toast({
      title: isNewEducation ? 'Education added' : 'Education updated',
      description: `The education entry has been ${isNewEducation ? 'added' : 'updated'} successfully.`
    });
  };

  const handleChange = (field: keyof Education, value: any) => {
    if (currentEducation) {
      setCurrentEducation({
        ...currentEducation,
        [field]: value
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Education</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Education
        </Button>
      </div>
      
      <div className="grid gap-4">
        {education.map((edu) => (
          <Card key={edu.id}>
            <CardHeader className="pb-2">
              <CardTitle>{edu.degree}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-lg mb-1">{edu.institution}</p>
              <p className="text-sm text-muted-foreground mb-2">
                {edu.startDate.substring(0, 7)} - {edu.current ? 'Present' : edu.endDate.substring(0, 7)}
              </p>
              <p className="text-sm">{edu.description}</p>
              {edu.grade && <p className="text-sm mt-1">Grade: {edu.grade}</p>}
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(edu)}>
                <PencilIcon className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(edu.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {education.some(edu => edu.id === currentEducation?.id) ? 'Edit Education' : 'Add New Education'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveEducation} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="institution" className="block text-sm font-medium">Institution</label>
              <Input
                id="institution"
                value={currentEducation?.institution || ''}
                onChange={(e) => handleChange('institution', e.target.value)}
                placeholder="University or institution name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="degree" className="block text-sm font-medium">Degree/Certification</label>
              <Input
                id="degree"
                value={currentEducation?.degree || ''}
                onChange={(e) => handleChange('degree', e.target.value)}
                placeholder="Degree or certification title"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-sm font-medium">Start Date</label>
                <Input
                  id="startDate"
                  type="date"
                  value={currentEducation?.startDate || ''}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-sm font-medium">End Date</label>
                <Input
                  id="endDate"
                  type="date"
                  value={currentEducation?.endDate || ''}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  disabled={currentEducation?.current}
                  required={!currentEducation?.current}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="current" 
                checked={currentEducation?.current || false}
                onCheckedChange={(checked) => handleChange('current', checked)}
              />
              <label 
                htmlFor="current" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Currently Studying
              </label>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium">Description</label>
              <Textarea
                id="description"
                value={currentEducation?.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of your studies"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="grade" className="block text-sm font-medium">Grade (Optional)</label>
              <Input
                id="grade"
                value={currentEducation?.grade || ''}
                onChange={(e) => handleChange('grade', e.target.value)}
                placeholder="e.g., 3.8 GPA, First Class Honors"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Education</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
