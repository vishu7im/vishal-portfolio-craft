
import React from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { usePortfolioData, Skill } from '@/services/dataService';

const Skills: React.FC = () => {
  const [skills] = usePortfolioData<Skill[]>('skills');

  return (
    <section className="bg-white py-16">
      <div className="section-container">
        <h2 className="section-title text-center">Skills & Expertise</h2>
        <p className="section-subtitle text-center mx-auto">
          Here are the technologies and tools I work with on a daily basis.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {skills.map((skill, index) => (
            <Card key={index} className="card-hover">
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-navy-800">{skill.name}</h3>
                    <span className="text-sm text-navy-600">{skill.level}%</span>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
