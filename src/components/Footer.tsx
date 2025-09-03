
import React from 'react';
import { usePortfolioData, Profile } from '@/services/dataService';

const Footer: React.FC = () => {
  const [profile] = usePortfolioData<Profile>('profile');

  return (
    <footer className="py-8 relative overflow-hidden">
      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">{profile.name}</h3>
            <p className="text-muted-foreground">{profile.title}</p>
            <p className="text-muted-foreground">{profile.company}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 gradient-text">Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a>
              </li>
              <li>
                <a href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              </li>
              <li>
                <a href="/projects" className="text-muted-foreground hover:text-primary transition-colors">Projects</a>
              </li>
              <li>
                <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 gradient-text">Contact</h4>
            <ul className="space-y-2">
              <li className="text-muted-foreground">{profile.email}</li>
              <li className="text-muted-foreground">{profile.phone}</li>
              <li className="text-muted-foreground">{profile.location}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 gradient-text">Social</h4>
            <div className="flex space-x-4">
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                GitHub
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
