
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolioData, Profile } from '@/services/dataService';

const Hero: React.FC = () => {
  const [profile] = usePortfolioData<Profile>('profile');

  return (
    <div className="bg-gradient-to-r from-navy-50 to-navy-100 min-h-[80vh] flex items-center">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy-900 mb-4">
              Hi, I'm <span className="text-primary">{profile.name}</span>
            </h1>
            <h2 className="text-2xl md:text-3xl text-navy-700 mb-6">
              {profile.title} at {profile.company}
            </h2>
            <p className="text-lg text-navy-600 mb-8 max-w-2xl">
              {profile.intro}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/projects">
                <Button className="btn-primary flex items-center gap-2 text-lg py-6 px-8">
                  View Projects <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="btn-outline text-lg py-6 px-8">
                  Contact Me
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="relative">
              <div className="w-72 h-72 rounded-full bg-primary/20 animate-pulse absolute -top-6 -left-6"></div>
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-80 h-80 object-cover rounded-lg shadow-xl relative z-10"
              />
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-lg shadow-lg">
                <p className="font-bold text-navy-900">{profile.experience} Experience</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
