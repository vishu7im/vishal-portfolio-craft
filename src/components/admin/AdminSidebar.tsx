
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Briefcase, FileText, Settings, GraduationCap, MessageSquareQuote, Palette } from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const navItems = [
    {
      label: 'Profile',
      icon: <User size={18} />,
      href: '/admin/profile'
    },
    {
      label: 'Experience',
      icon: <Briefcase size={18} />,
      href: '/admin/experience'
    },
    {
      label: 'Education',
      icon: <GraduationCap size={18} />,
      href: '/admin/education'
    },
    {
      label: 'Projects',
      icon: <FileText size={18} />,
      href: '/admin/projects'
    },
    {
      label: 'Testimonials',
      icon: <MessageSquareQuote size={18} />,
      href: '/admin/testimonials'
    },
    {
      label: 'Customization',
      icon: <Palette size={18} />,
      href: '/admin/customization'
    },
    {
      label: 'Settings',
      icon: <Settings size={18} />,
      href: '/admin/settings'
    }
  ];

  return (
    <aside className="bg-white border-r border-gray-200 w-64 hidden md:block">
      <div className="p-4">
        <nav>
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;
