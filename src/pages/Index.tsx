import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import ProjectsSection from "@/components/ProjectsSection";
import ExperienceSection from "@/components/ExperienceSection";
import EducationSection from "@/components/EducationSection";
import Background from "@/components/Background";
import TiltEffect from "@/components/TiltEffect";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import PersonalStats from "@/components/PersonalStats";
import Testimonials from "@/components/Testimonials";
import ContactCTA from "@/components/ContactCTA";
import ScrollReveal from "@/components/ScrollReveal";

const Index: React.FC = () => {
  // Initialize the reveal on scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    });

    document.querySelectorAll(".reveal").forEach((element) => {
      observer.observe(element);
    });

    return () => {
      document.querySelectorAll(".reveal").forEach((element) => {
        observer.unobserve(element);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/70 relative theme-transition">
      <Background />
      <Header />
      <Hero />
      <div className="py-8  backdrop-blur-sm">
        <ScrollReveal>
          <PersonalStats />
        </ScrollReveal>
      </div>
      <Skills />
      <ExperienceSection />

      <ProjectsSection />
      <EducationSection />
      <Testimonials />
      <ContactCTA />
      <Footer />
      <TiltEffect />
      <ThemeSwitcher />
    </div>
  );
};

export default Index;
