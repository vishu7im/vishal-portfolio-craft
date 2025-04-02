
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { usePortfolioData, Profile } from '@/services/dataService';
import Skills from '@/components/Skills';
import ExperienceSection from '@/components/ExperienceSection';

const About: React.FC = () => {
  const [profile] = usePortfolioData<Profile>('profile');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <section className="bg-navy-50 py-16">
          <div className="section-container">
            <h1 className="section-title text-center">About Me</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
              <div>
                <img 
                  src={profile.avatar} 
                  alt={profile.name} 
                  className="rounded-lg shadow-lg w-full max-w-md mx-auto"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy-900 mb-4">
                  {profile.name} - {profile.title}
                </h2>
                <p className="text-navy-700 mb-6">
                  {profile.bio}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-navy-900">Location</h3>
                    <p className="text-navy-700">{profile.location}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">Experience</h3>
                    <p className="text-navy-700">{profile.experience}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">Email</h3>
                    <p className="text-navy-700">{profile.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">Phone</h3>
                    <p className="text-navy-700">{profile.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <Skills />
        <ExperienceSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
