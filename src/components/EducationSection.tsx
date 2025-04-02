
import React from 'react';
import { usePortfolioData } from '@/services/dataService';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { Education } from '@/services/dataService';

export default function EducationSection() {
  const [education] = usePortfolioData<Education[]>('education');

  return (
    <section className="py-16 relative" id="education">
      <div className="section-container">
        <ScrollReveal>
          <h2 className="section-title text-center">Education & Certifications</h2>
          <p className="section-subtitle text-center mx-auto">
            My academic background and professional training
          </p>
        </ScrollReveal>

        <div className="mt-10 space-y-4">
          {education.map((edu, index) => (
            <ScrollReveal key={edu.id} delay={index * 100} threshold={0.1}>
              <Card className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start">
                    <div className="p-3 bg-primary/10 rounded-full mr-4 hidden sm:flex">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <h3 className="font-semibold text-xl">{edu.degree}</h3>
                        <div className="text-sm text-muted-foreground">
                          {edu.startDate.substring(0, 7)} - {edu.current ? 'Present' : edu.endDate.substring(0, 7)}
                        </div>
                      </div>
                      <p className="text-lg font-medium">{edu.institution}</p>
                      <p className="text-muted-foreground">{edu.description}</p>
                      {edu.grade && (
                        <p className="text-sm font-semibold">Grade: {edu.grade}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
