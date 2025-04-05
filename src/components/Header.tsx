import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Menu, X } from "lucide-react";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white/90 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link to="/" className="font-extrabold text-xl text-navy-900">
          Vishu<span className="text-primary">.dev</span>
        </Link>

        <nav className="hidden md:flex space-x-8">
          <Link
            to="/"
            className="text-navy-700 hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            className="text-navy-700 hover:text-primary transition-colors"
          >
            About
          </Link>
          <Link
            to="/projects"
            className="text-navy-700 hover:text-primary transition-colors"
          >
            Projects
          </Link>
          <Link
            to="/contact"
            className="text-navy-700 hover:text-primary transition-colors"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-navy-700 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-navy-700 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link
              to="/projects"
              className="block px-3 py-2 text-navy-700 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Projects
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-navy-700 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
