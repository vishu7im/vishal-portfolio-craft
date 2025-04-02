
import React, { useState } from 'react';
import { usePortfolioData, generateId, Testimonial } from '@/services/dataService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PencilIcon, PlusCircle, QuoteIcon, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = usePortfolioData<Testimonial[]>('testimonials');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null);
  
  const initialTestimonial: Testimonial = {
    id: '',
    name: '',
    position: '',
    company: '',
    avatar: '/placeholder.svg',
    content: ''
  };

  const handleAddNew = () => {
    setCurrentTestimonial({
      ...initialTestimonial,
      id: generateId()
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setCurrentTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedTestimonials = testimonials.filter(t => t.id !== id);
    setTestimonials(updatedTestimonials);
    toast({
      title: 'Testimonial deleted',
      description: 'The testimonial has been removed successfully.'
    });
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTestimonial) return;
    
    const isNewTestimonial = !testimonials.some(t => t.id === currentTestimonial.id);
    let updatedTestimonials: Testimonial[];
    
    if (isNewTestimonial) {
      updatedTestimonials = [...testimonials, currentTestimonial];
    } else {
      updatedTestimonials = testimonials.map(t => 
        t.id === currentTestimonial.id ? currentTestimonial : t
      );
    }
    
    setTestimonials(updatedTestimonials);
    setIsDialogOpen(false);
    toast({
      title: isNewTestimonial ? 'Testimonial added' : 'Testimonial updated',
      description: `The testimonial has been ${isNewTestimonial ? 'added' : 'updated'} successfully.`
    });
  };

  const handleChange = (field: keyof Testimonial, value: string) => {
    if (currentTestimonial) {
      setCurrentTestimonial({
        ...currentTestimonial,
        [field]: value
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Testimonials</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Testimonial
        </Button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{testimonial.name}</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {testimonial.position}, {testimonial.company}
              </p>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex">
                <QuoteIcon className="h-4 w-4 text-primary mr-2 shrink-0 mt-0.5" />
                <p className="text-sm">{testimonial.content}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                <PencilIcon className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(testimonial.id)}>
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
              {testimonials.some(t => t.id === currentTestimonial?.id) ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSaveTestimonial} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">Name</label>
              <Input
                id="name"
                value={currentTestimonial?.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Client's name"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="position" className="block text-sm font-medium">Position</label>
                <Input
                  id="position"
                  value={currentTestimonial?.position || ''}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="Client's position"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="company" className="block text-sm font-medium">Company</label>
                <Input
                  id="company"
                  value={currentTestimonial?.company || ''}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Client's company"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="avatar" className="block text-sm font-medium">Avatar URL (Optional)</label>
              <Input
                id="avatar"
                value={currentTestimonial?.avatar || ''}
                onChange={(e) => handleChange('avatar', e.target.value)}
                placeholder="/placeholder.svg"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="content" className="block text-sm font-medium">Testimonial Content</label>
              <Textarea
                id="content"
                value={currentTestimonial?.content || ''}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="What the client said about you and your work..."
                rows={5}
                required
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Testimonial</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
