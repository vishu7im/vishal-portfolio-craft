
import React from 'react';
import { usePortfolioData } from '@/services/dataService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { QuoteIcon } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { Testimonial } from '@/services/dataService';

export default function Testimonials() {
  const [testimonials] = usePortfolioData<Testimonial[]>('testimonials');

  return (
    <section className="py-8 relative overflow-hidden">
      <div className="section-container relative z-10">
        <ScrollReveal>
          <h2 className="section-title text-center gradient-text">Testimonials</h2>
          <p className="section-subtitle text-center mx-auto">
            Client feedback
          </p>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={testimonial.id} threshold={0.1} delay={index * 100}>
              <Card className="minimal-card p-6 h-full hover:bg-gradient-to-br hover:from-blue-500/5 hover:to-purple-500/5 group">
                <CardContent className="p-0 flex flex-col h-full">
                  <p className="text-sm text-muted-foreground mb-4 flex-grow">"{testimonial.content}"</p>
                  <div className="flex items-center pt-4 border-t border-border/20">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.position}
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
