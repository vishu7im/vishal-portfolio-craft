import React, { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Background from "@/components/Background";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePortfolioData, Project } from "@/services/dataService";
import { ExternalLink, Github } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const Projects: React.FC = () => {
  const [projects] = usePortfolioData<Project[]>("projects");

  useEffect(() => {
    // Apply the 3D tilt effect to project cards
    const cards = document.querySelectorAll(".tilt-card");

    const handleMouseMove = (e: MouseEvent, card: Element) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      const rotateX = deltaY * -5;
      const rotateY = deltaX * 5;

      (
        card as HTMLElement
      ).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    };

    const handleMouseLeave = (card: Element) => {
      (card as HTMLElement).style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
    };

    const handleTiltEffect = (e: Event) => {
      if (!(e instanceof MouseEvent)) return;

      const target = e.currentTarget;
      if (target instanceof Element) {
        handleMouseMove(e, target);
      }
    };

    const handleTiltReset = (e: Event) => {
      const target = e.currentTarget;
      if (target instanceof Element) {
        handleMouseLeave(target);
      }
    };

    cards.forEach((card) => {
      card.addEventListener("mousemove", handleTiltEffect);
      card.addEventListener("mouseleave", handleTiltReset);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener("mousemove", handleTiltEffect);
        card.removeEventListener("mouseleave", handleTiltReset);
      });
    };
  }, [projects]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Header />
      <Background />
      <ThemeSwitcher />

      <main className="flex-grow gradient-section py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10"></div>
        
        {/* Projects page gradient elements */}
        <div className="absolute top-10 left-10 w-60 h-60 bg-gradient-to-r from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="section-container relative z-10">
          <ScrollReveal>
            <h1 className="section-title text-center gradient-text text-4xl">
              Projects
            </h1>
            <p className="section-subtitle text-center mx-auto">
              My work & projects
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {projects.map((project, index) => (
              <ScrollReveal
                key={project.id}
                threshold={0.1}
                delay={index * 100}
              >
                <Card className="minimal-card p-6 flex flex-col h-full hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-purple-500/5 group">
                  <CardHeader className="p-0 mb-4">
                    <CardTitle className="gradient-text text-lg">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-grow">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge
                          key={techIndex}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-0 flex gap-4">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Github size={14} />
                        Code
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ExternalLink size={14} />
                        Demo
                      </a>
                    )}
                  </CardFooter>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;
