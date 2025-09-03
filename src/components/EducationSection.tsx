
import React from 'react';
import { usePortfolioData } from '@/services/dataService';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { Education } from '@/services/dataService';

export default function EducationSection() {
  const [education] = usePortfolioData<Education[]>('education');

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">Education</h2>
          <p className="section-subtitle text-center mx-auto">
            Academic background
          </p>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto mt-8 space-y-4">
          {education.map((edu, index) => (
            <ScrollReveal key={edu.id} delay={index * 100} threshold={0.1}>
              <Card className="minimal-card p-6 hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-pink-500/5 group">
                <CardContent className="p-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="gradient-text text-lg font-semibold">{edu.degree}</h3>
                      <p className="font-medium">{edu.institution}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {edu.startDate.substring(0, 7)} - {edu.current ? 'Present' : edu.endDate.substring(0, 7)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{edu.description}</p>
                  {edu.grade && (
                    <p className="text-xs font-medium">Grade: {edu.grade}</p>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
