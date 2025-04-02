
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePortfolioData, Experience } from '@/services/dataService';
import { format } from 'date-fns';
import { Briefcase } from 'lucide-react';

const ExperienceSection: React.FC = () => {
  const [experiences] = usePortfolioData<Experience[]>('experience');

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch (error) {
      console.error('Invalid date:', dateString);
      return dateString;
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="section-container">
        <h2 className="section-title text-center">Work Experience</h2>
        <p className="section-subtitle text-center mx-auto">
          My professional journey in the tech industry.
        </p>
        
        <div className="max-w-3xl mx-auto mt-12">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="mb-8 relative">
              {index !== experiences.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200 z-0"></div>
              )}
              
              <Card className="card-hover relative z-10">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="bg-primary rounded-full p-2 text-white">
                    <Briefcase size={20} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <CardTitle>{exp.position}</CardTitle>
                        <CardDescription className="text-base mt-1">{exp.company}</CardDescription>
                      </div>
                      <div className="text-sm text-navy-600">
                        {formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-navy-700 mb-4">{exp.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {exp.technologies.map((tech, idx) => (
                      <Badge key={idx} variant="outline" className="mr-1 mb-1">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
