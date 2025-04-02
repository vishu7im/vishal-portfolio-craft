
import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Palette, X } from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleOpen = () => setIsOpen(!isOpen);
  
  return (
    <>
      {/* Mobile theme switcher */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <Button
          onClick={toggleOpen}
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-primary shadow-lg shadow-primary/20 animate-pulse-slow"
        >
          {isOpen ? (
            <X size={20} />
          ) : (
            <Palette size={20} className="rotate-0 scale-100 transition-all" />
          )}
        </Button>
        
        {isOpen && (
          <div className="absolute bottom-16 right-0 flex flex-col gap-2 animate-slide-in">
            <Button
              size="icon"
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="h-10 w-10 rounded-full"
            >
              <Moon size={18} />
            </Button>
            <Button
              size="icon"
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="h-10 w-10 rounded-full"
            >
              <Sun size={18} />
            </Button>
            <Button
              size="icon"
              variant={theme === 'cyberpunk' ? 'default' : 'outline'}
              onClick={() => setTheme('cyberpunk')}
              className="h-10 w-10 rounded-full bg-cyber-primary text-black"
            >
              <span className="text-xs font-bold">CP</span>
            </Button>
            <Button
              size="icon"
              variant={theme === 'retro' ? 'default' : 'outline'}
              onClick={() => setTheme('retro')}
              className="h-10 w-10 rounded-full text-primary"
            >
              <span className="text-xs font-bold">RE</span>
            </Button>
          </div>
        )}
      </div>
      
      {/* Desktop theme switcher */}
      <div className="fixed top-20 right-6 z-50 hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border-primary shadow-lg shadow-primary/20"
            >
              {theme === 'dark' && <Moon size={18} />}
              {theme === 'light' && <Sun size={18} />}
              {theme === 'cyberpunk' && <span className="text-xs font-bold text-cyber-primary">CP</span>}
              {theme === 'retro' && <span className="text-xs font-bold">RE</span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="animate-fade-in">
            <DropdownMenuItem onClick={() => setTheme('dark')} className="cursor-pointer">
              <Moon size={16} className="mr-2" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('light')} className="cursor-pointer">
              <Sun size={16} className="mr-2" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('cyberpunk')} className="cursor-pointer">
              <span className="w-4 h-4 rounded-full bg-cyber-primary mr-2" /> Cyberpunk
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('retro')} className="cursor-pointer">
              <span className="w-4 h-4 rounded-full bg-[#f3b27a] mr-2" /> Retro
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
