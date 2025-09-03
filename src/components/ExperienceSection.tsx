import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePortfolioData, Experience } from "@/services/dataService";
import { format, parse } from "date-fns";
import { Briefcase } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const ExperienceSection: React.FC = () => {
  const [experiences] = usePortfolioData<Experience[]>("experience");

  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    try {
      // Try parsing with 'yyyy - MMM' format first
      let parsedDate = parse(dateString, "yyyy - MMM", new Date());
      
      // If that fails, try 'MMM - yyyy' format
      if (isNaN(parsedDate.getTime())) {
        parsedDate = parse(dateString, "MMM - yyyy", new Date());
      }
      
      // If both fail, try the original Date constructor as fallback
      if (isNaN(parsedDate.getTime())) {
        parsedDate = new Date(dateString);
      }
      
      return format(parsedDate, "MMM yyyy");
    } catch (error) {
      console.error("Invalid date:", dateString);
      return dateString;
    }
  };

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">Experience</h2>
          <p className="section-subtitle text-center mx-auto">
            Professional journey
          </p>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto mt-8 space-y-6">
          {experiences.map((exp, index) => (
            <ScrollReveal key={exp.id} threshold={0.1} delay={index * 150}>
              <Card className="minimal-card p-6 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-purple-500/5 group">
                <CardHeader className="p-0 mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="gradient-text text-lg">
                        {exp.position}
                      </CardTitle>
                      <CardDescription className="font-medium">
                        {exp.company}
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm text-muted-foreground mb-3">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.slice(0, 6).map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
