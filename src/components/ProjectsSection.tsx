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
    <section className="py-8 relative overflow-hidden">
      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">Projects</h2>
          <p className="section-subtitle text-center mx-auto">
            Recent work & projects
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {featuredProjects.map((project, index) => (
            <ScrollReveal key={project.id} threshold={0.1} delay={index * 150}>
              <Card className="minimal-card p-6 flex flex-col h-full group hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-purple-500/5">
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
                    {project.technologies.slice(0, 4).map((tech, techIndex) => (
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

        <div className="text-center mt-8">
          <ScrollReveal threshold={0.5} delay={300}>
            <Link to="/projects">
              <Button variant="outline" className="text-sm">
                View All Projects
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
