
import React from 'react';
import { usePortfolioData, Profile } from '@/services/dataService';
import { Trophy, Briefcase, Code, Clock } from 'lucide-react';
import { motion } from '@/lib/motion';

export default function PersonalStats() {
  const [profile] = usePortfolioData<Profile>('profile');

  const stats = [
    { value: '3+', label: 'Years Experience' },
    { value: '10+', label: 'Projects' },
    { value: '3+', label: 'Certifications' },
    { value: '24/7', label: 'Available' },
  ];

  return (
    <div className="py-6 relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="minimal-card p-4 text-center hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 group"
            >
              <h3 className="text-2xl font-bold gradient-text mb-1 group-hover:scale-110 transition-transform duration-300">{stat.value}</h3>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
