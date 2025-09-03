import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePortfolioData, Skill } from "@/services/dataService";
import ScrollReveal from "./ScrollReveal";

const Skills: React.FC = () => {
  const [skills] = usePortfolioData<Skill[]>("skills");

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">Skills</h2>
          <p className="section-subtitle text-center mx-auto">
            Technologies & tools
          </p>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-3 mt-8 max-w-4xl mx-auto">
          {skills.map((skill, index) => (
            <ScrollReveal key={index} threshold={0.2} delay={index * 50}>
              <div className="minimal-card px-4 py-2 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 group">
                <span className="text-sm font-medium">{skill.name}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
