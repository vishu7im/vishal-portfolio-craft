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
import { format } from "date-fns";
import { Briefcase } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const ExperienceSection: React.FC = () => {
  const [experiences] = usePortfolioData<Experience[]>("experience");

  const formatDate = (dateString: string) => {
    if (!dateString) return "Present";
    try {
      return format(new Date(dateString), "MMM yyyy");
    } catch (error) {
      console.error("Invalid date:", dateString);
      return dateString;
    }
  };

  return (
    <section className=" py-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-navy-100/30 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-navy-100/20 rounded-tr-full"></div>

      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">
            Work Experience
          </h2>
          <p className="section-subtitle text-center mx-auto">
            My professional journey in the tech industry.
          </p>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto mt-12">
          {experiences.map((exp, index) => (
            <ScrollReveal key={exp.id} threshold={0.1} delay={index * 200}>
              <div className="mb-8 relative ">
                {index !== experiences.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary/30 z-0"></div>
                )}

                <Card className="card-hover tilt-card  border-l-primary border relative z-10  shadow-lg overflow-hidden">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="bg-primary rounded-full p-3 text-white animate-pulse">
                      <Briefcase size={20} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex flex-wrap justify-between items-start">
                        <div>
                          <CardTitle className="gradient-text">
                            {exp.position}
                          </CardTitle>
                          <CardDescription className="text-base mt-1 font-medium">
                            {exp.company}
                          </CardDescription>
                        </div>
                        <div className="text-sm  bg-navy-100/30 px-3 py-1 rounded-full">
                          {formatDate(exp.startDate)} —{" "}
                          {exp.current ? "Present" : formatDate(exp.endDate)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-navy-700 mb-4 leading-relaxed">
                      {exp.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {exp.technologies.map((tech, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="animate-pulse"
                          style={{
                            animationDelay: `${idx * 0.2}s`,
                            animationDuration: "4s",
                          }}
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
