
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
import { usePortfolioData, Project, generateId } from '@/services/dataService';
import { Edit, Trash, Image as ImageIcon } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import { uploadImage } from '@/services/uploadService';

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = usePortfolioData<Project[]>('projects');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>({
    id: '',
    title: '',
    description: '',
    image: '',
    technologies: [],
    github: '',
    demo: '',
    featured: false
  });
  const [techInput, setTechInput] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = () => {
    setCurrentProject({
      id: '',
      title: '',
      description: '',
      image: '',
      technologies: [],
      github: '',
      demo: '',
      featured: false
    });
    setTechInput('');
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckbox = (checked: boolean) => {
    setCurrentProject(prev => ({
      ...prev,
      featured: checked
    }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !currentProject.technologies.includes(techInput.trim())) {
      setCurrentProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (tech: string) => {
    setCurrentProject(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleEdit = (project: Project) => {
    setCurrentProject({...project});
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      setProjects(projects.filter(proj => proj.id !== projectToDelete));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const downloadURL = await uploadImage(file, "projects");
      setCurrentProject(prev => ({
        ...prev,
        image: downloadURL
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      ...currentProject,
      id: currentProject.id || generateId()
    };
    
    if (isEditing) {
      setProjects(projects.map(proj => 
        proj.id === formData.id ? formData : proj
      ));
    } else {
      setProjects([...projects, formData]);
    }
    
    resetForm();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Projects</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            Add Project
          </Button>
        )}
      </div>
      
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{currentProject.id ? 'Edit' : 'Add'} Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={currentProject.title}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={currentProject.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Image
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div className="flex flex-col space-y-4">
                    <FileUpload
                      onUpload={handleImageUpload}
                      label="Upload Project Image"
                      isUploading={isUploading}
                    />
                    <Input
                      id="image"
                      name="image"
                      value={currentProject.image}
                      onChange={handleChange}
                      placeholder="Or enter image URL"
                    />
                  </div>
                  
                  {currentProject.image && (
                    <div className="flex justify-center">
                      <div className="relative border rounded-md overflow-hidden w-full max-w-xs">
                        <img
                          src={currentProject.image}
                          alt="Project preview"
                          className="w-full h-auto object-cover aspect-video"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub URL
                  </label>
                  <Input
                    id="github"
                    name="github"
                    value={currentProject.github}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="demo" className="block text-sm font-medium text-gray-700 mb-1">
                    Demo URL
                  </label>
                  <Input
                    id="demo"
                    name="demo"
                    value={currentProject.demo}
                    onChange={handleChange}
                  />
                </div>
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
                  {currentProject.technologies.map((tech, index) => (
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
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="featured" 
                  checked={currentProject.featured} 
                  onCheckedChange={handleCheckbox}
                />
                <label 
                  htmlFor="featured"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Featured Project
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {currentProject.id ? 'Update' : 'Add'} Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Project List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Technologies</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length > 0 ? (
                  projects.map(project => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        {project.image ? (
                          <div className="w-10 h-10 overflow-hidden rounded">
                            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <ImageIcon size={16} className="text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell>{project.featured ? 'Yes' : 'No'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.slice(0, 3).map((tech, i) => (
                            <span key={i} className="bg-gray-100 px-2 py-0.5 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && 
                            <span className="text-xs text-gray-500">+{project.technologies.length - 3} more</span>
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No projects found
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
              This action cannot be undone. This will permanently delete the project.
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

export default AdminProjects;
