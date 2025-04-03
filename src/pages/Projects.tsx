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

      <main className="flex-grow bg-background/80 backdrop-blur-sm py-16 relative">
        <div className="section-container">
          <ScrollReveal>
            <h1 className="section-title text-center gradient-text text-5xl">
              Projects
            </h1>
            <p className="section-subtitle text-center mx-auto">
              A collection of my work and projects I've built.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {projects.map((project, index) => (
              <ScrollReveal
                key={project.id}
                threshold={0.1}
                delay={index * 150}
              >
                <Card className="card-hover tilt-card flex flex-col h-full border-none shadow-lg overflow-hidden">
                  <div className="h-48 overflow-hidden group relative">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-white text-sm font-medium">
                        Featured Project
                      </span>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="gradient-text">
                      {project.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge
                          key={techIndex}
                          variant="secondary"
                          className="mr-1 mb-1"
                          style={{
                            animationDelay: `${techIndex * 0.1}s`,
                            animationDuration: "3s",
                          }}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="text-navy-700">
                      {project.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-navy-700 hover:text-primary transition-colors group"
                      >
                        <Github
                          size={16}
                          className="transition-transform duration-200 group-hover:rotate-12"
                        />{" "}
                        Code
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-navy-700 hover:text-primary transition-colors group"
                      >
                        <ExternalLink
                          size={16}
                          className="transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1"
                        />{" "}
                        Live Demo
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
