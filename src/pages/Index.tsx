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
import ChatBotTrigger from "@/components/ChatBotTrigger";
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
    <div className="min-h-screen flex flex-col relative theme-transition global-gradient">
      <Background />
      <Header />
      <div className="flex-1">
        <Hero />
        <PersonalStats />
        <Skills />
        <ExperienceSection />
        <ProjectsSection />
        <EducationSection />
        {/* <Testimonials /> */}
        <ContactCTA />
      </div>
      <Footer />
      <TiltEffect />
      <ChatBotTrigger />
      <ThemeSwitcher />
    </div>
  );
};

export default Index;
