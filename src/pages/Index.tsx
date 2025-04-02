
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import Skills from '@/components/Skills';
import ProjectsSection from '@/components/ProjectsSection';
import ExperienceSection from '@/components/ExperienceSection';
import Background from '@/components/Background';
import TiltEffect from '@/components/TiltEffect';

const Index: React.FC = () => {
  // Initialize the reveal on scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    });

    document.querySelectorAll('.reveal').forEach(element => {
      observer.observe(element);
    });

    return () => {
      document.querySelectorAll('.reveal').forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-navy-50 to-navy-100 relative">
      <Background />
      <Header />
      <Hero />
      <Skills />
      <ProjectsSection />
      <ExperienceSection />
      <Footer />
      <TiltEffect />
    </div>
  );
};

export default Index;
