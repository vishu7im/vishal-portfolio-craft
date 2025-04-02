
import React from 'react';
import { usePortfolioData, Profile } from '@/services/dataService';
import { Trophy, Briefcase, Code, Clock } from 'lucide-react';
import { motion } from '@/lib/motion';

export default function PersonalStats() {
  const [profile] = usePortfolioData<Profile>('profile');
  
  const stats = [
    { 
      icon: <Briefcase className="h-6 w-6 text-primary" />, 
      value: '2+ Years', 
      label: 'Professional Experience',
      delay: 0.1
    },
    { 
      icon: <Code className="h-6 w-6 text-primary" />, 
      value: '10+', 
      label: 'Projects Completed',
      delay: 0.2
    },
    { 
      icon: <Trophy className="h-6 w-6 text-primary" />, 
      value: '3+', 
      label: 'Industry Certifications',
      delay: 0.3
    },
    { 
      icon: <Clock className="h-6 w-6 text-primary" />, 
      value: '24/7', 
      label: 'Support & Availability',
      delay: 0.4
    },
  ];

  return (
    <div className="section-container py-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: stat.delay }}
            viewport={{ once: true }}
            className="group bg-card/60 backdrop-blur-sm p-4 rounded-lg border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-3 p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300">
                {stat.icon}
              </div>
              <h3 className="text-xl md:text-2xl font-bold gradient-text mb-1">{stat.value}</h3>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
