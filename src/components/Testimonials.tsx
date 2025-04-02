
import React from 'react';
import { usePortfolioData } from '@/services/dataService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteIcon } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  avatar: string;
  content: string;
}

export default function Testimonials() {
  // We'll use a hardcoded array for now since the data service might not have testimonials yet
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'John Smith',
      position: 'CTO',
      company: 'Tech Innovations',
      avatar: '/placeholder.svg',
      content: 'Vishal is one of the most talented backend developers I've worked with. His attention to detail and commitment to quality code is impressive.'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      position: 'Project Manager',
      company: 'WebSolutions',
      avatar: '/placeholder.svg',
      content: 'Working with Vishal was a game-changer for our project. He delivered everything on time and his technical skills are outstanding.'
    },
    {
      id: '3',
      name: 'Michael Chen',
      position: 'Lead Developer',
      company: 'CodeCorp',
      avatar: '/placeholder.svg',
      content: 'Vishal's backend expertise helped us solve complex performance issues. His code is clean, well-documented, and highly maintainable.'
    },
  ];

  return (
    <section className="py-16 bg-muted/30 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl"></div>
      
      <div className="section-container">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">What People Say</h2>
          <p className="section-subtitle text-center mx-auto">
            Client testimonials and feedback from collaborators
          </p>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} threshold={0.1} delay={index * 100}>
              <Card className="bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border border-border hover:-translate-y-1 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <QuoteIcon className="h-8 w-8 text-primary/70 mb-4" />
                  <p className="text-card-foreground/90 mb-6 flex-grow">"{testimonial.content}"</p>
                  <div className="flex items-center mt-auto pt-4 border-t border-border">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.position}, {testimonial.company}
                      </p>
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
