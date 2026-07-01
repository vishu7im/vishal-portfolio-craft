import db from '../data/db.json';
import { useState, useEffect } from 'react';

// Types
export interface Profile {
  name: string;
  title: string;
  company: string;
  experience: string;
  intro: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedin: string;
  avatar: string;
  aboutImage?: string;
  resume?: string;
  resumeName?: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  grade: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  github: string;
  demo: string;
  featured: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  avatar: string;
  content: string;
}

export interface AppTheme {
  name: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface DatabaseSchema {
  profile: Profile;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  testimonials: Testimonial[];
  admin?: { username: string; password: string };
  theme?: AppTheme;
}

// Initial data
let data: DatabaseSchema = JSON.parse(JSON.stringify(db));

// Load data from localStorage if available
const loadData = () => {
  try {
    const storedData = localStorage.getItem('portfolioData');
    if (storedData) {
      data = JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
  }
};

// Save data to localStorage
const saveData = () => {
  try {
    localStorage.setItem('portfolioData', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
};

// Initialize data
loadData();

// Non-hook accessor for non-React consumers (e.g. Phaser scenes).
export function getPortfolioData(): DatabaseSchema {
  loadData();
  return data;
}

// Hook for accessing data
export function usePortfolioData<T>(key: keyof DatabaseSchema): [T, (newData: T) => void] {
  const [value, setValue] = useState<T>(data[key] as unknown as T);

  useEffect(() => {
    // Load data when component mounts
    loadData();
    setValue(data[key] as unknown as T);
  }, [key]);

  const updateValue = (newValue: T) => {
    data = {
      ...data,
      [key]: newValue
    };
    setValue(newValue);
    saveData();
  };

  return [value, updateValue];
}

// Helper functions to generate unique IDs
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
