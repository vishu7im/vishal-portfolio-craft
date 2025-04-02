import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { ExternalLink, Github, ChevronRight } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const ProjectsSection: React.FC = () => {
  const [projects] = usePortfolioData<Project[]>("projects");
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-100/50"></div>
      <div className="absolute top-20 right-40 w-32 h-32 bg-blue-300/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-purple-300/10 rounded-full blur-xl"></div>

      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">
            Featured Projects
          </h2>
          <p className="section-subtitle text-center mx-auto">
            Check out some of my recent work.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {featuredProjects.map((project, index) => (
            <ScrollReveal key={project.id} threshold={0.1} delay={index * 150}>
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

        <div className="text-center mt-12">
          <ScrollReveal threshold={0.5} delay={600}>
            <Link to="/projects">
              <Button
                variant="outline"
                className="btn-outline group overflow-hidden relative"
              >
                <span className="relative z-10">View All Projects</span>
                <ChevronRight className="ml-2 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-primary transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></div>
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
