
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePortfolioData, Profile } from '@/services/dataService';
import FileUpload from '@/components/FileUpload';
import { uploadImage } from '@/services/uploadService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AdminProfile: React.FC = () => {
  const [profile, setProfile] = usePortfolioData<Profile>('profile');
  const [formData, setFormData] = useState<Profile>(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setProfile(formData);
      setIsSubmitting(false);
    }, 500);
  };

  const handleProfileImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const downloadURL = await uploadImage(file, "profile");
      setFormData(prev => ({
        ...prev,
        avatar: downloadURL
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleAboutImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const downloadURL = await uploadImage(file, "about");
      setFormData(prev => ({
        ...prev,
        aboutImage: downloadURL
      }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'pdf') {
        throw new Error("Only PDF files are supported");
      }
      
      setResumeFile(file);
      // We'll handle the actual upload when the form is submitted
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setFormData(prev => ({
            ...prev,
            resume: URL.createObjectURL(file),
            resumeName: file.name
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Resume upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="media">Media & Resume</TabsTrigger>
        </TabsList>
        
        <form onSubmit={handleSubmit}>
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <Input
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="intro" className="block text-sm font-medium text-gray-700 mb-1">
                    Short Introduction
                  </label>
                  <Textarea
                    id="intro"
                    name="intro"
                    value={formData.intro}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="github" className="block text-sm font-medium text-gray-700 mb-1">
                      GitHub URL
                    </label>
                    <Input
                      id="github"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn URL
                    </label>
                    <Input
                      id="linkedin"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Images & Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Profile Image</h3>
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="w-24 h-24">
                        {formData.avatar ? (
                          <AvatarImage src={formData.avatar} alt="Profile" />
                        ) : (
                          <AvatarFallback>{formData.name?.charAt(0) || 'U'}</AvatarFallback>
                        )}
                      </Avatar>
                      <FileUpload 
                        onUpload={handleProfileImageUpload} 
                        label="Upload Profile Image"
                        isUploading={isUploading}
                      />
                      <Input
                        id="avatar"
                        name="avatar"
                        value={formData.avatar || ''}
                        onChange={handleChange}
                        placeholder="Or enter image URL"
                        className="mt-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">About Page Image</h3>
                    <div className="flex flex-col items-center space-y-4">
                      {formData.aboutImage && (
                        <img 
                          src={formData.aboutImage} 
                          alt="About" 
                          className="w-48 h-auto object-cover rounded-md border"
                        />
                      )}
                      <FileUpload 
                        onUpload={handleAboutImageUpload} 
                        label="Upload About Image"
                        isUploading={isUploading}
                      />
                      <Input
                        id="aboutImage"
                        name="aboutImage"
                        value={formData.aboutImage || ''}
                        onChange={handleChange}
                        placeholder="Or enter image URL"
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">Resume</h3>
                  <div className="space-y-4">
                    <FileUpload 
                      onUpload={handleResumeUpload}
                      label="Upload Resume (PDF)"
                      accept=".pdf"
                      isUploading={isUploading}
                    />
                    
                    {formData.resume && (
                      <div className="flex flex-col space-y-2 p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-medium">{formData.resumeName || 'Resume.pdf'}</span>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={formData.resume} target="_blank" rel="noopener noreferrer">Preview</a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <a href={formData.resume} download={formData.resumeName || "resume.pdf"}>Download</a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Input
                      id="resume"
                      name="resume"
                      value={formData.resume || ''}
                      onChange={handleChange}
                      placeholder="Or enter resume URL"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
};

export default AdminProfile;
