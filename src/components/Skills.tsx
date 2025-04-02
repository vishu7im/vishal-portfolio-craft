import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePortfolioData, Skill } from "@/services/dataService";
import ScrollReveal from "./ScrollReveal";

const Skills: React.FC = () => {
  const [skills] = usePortfolioData<Skill[]>("skills");

  return (
    <section className=" py-16 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-40 h-40 bg-primary/5 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 bg-primary/10 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-navy-200/30 rounded-full animate-float"></div>
      </div>

      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">
            Skills & Expertise
          </h2>
          <p className="section-subtitle text-center mx-auto">
            Here are the technologies and tools I work with on a daily basis.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {skills.map((skill, index) => (
            <ScrollReveal key={index} threshold={0.2} delay={index * 100}>
              <Card className="card-hover tilt-card backdrop-blur-sm bg-white/80">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-navy-800">
                        {skill.name}
                      </h3>
                      <span className="text-sm text-navy-600">
                        {skill.level}%
                      </span>
                    </div>
                    <Progress
                      value={skill.level}
                      className="h-2 overflow-hidden"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 animate-pulse"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </Progress>
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

export default Skills;
