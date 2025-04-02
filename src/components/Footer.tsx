
import React from 'react';
import { usePortfolioData, Profile } from '@/services/dataService';

const Footer: React.FC = () => {
  const [profile] = usePortfolioData<Profile>('profile');

  return (
    <footer className="bg-navy-950 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">{profile.name}</h3>
            <p className="text-gray-300">{profile.title}</p>
            <p className="text-gray-300">{profile.company}</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">About</a>
              </li>
              <li>
                <a href="/projects" className="text-gray-300 hover:text-white transition-colors">Projects</a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-gray-300">{profile.email}</li>
              <li className="text-gray-300">{profile.phone}</li>
              <li className="text-gray-300">{profile.location}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Social</h4>
            <div className="flex space-x-4">
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                GitHub
              </a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
