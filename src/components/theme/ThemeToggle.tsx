import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleDarkMode}
      className={`
        relative w-10 h-10 rounded-full transition-all duration-300
        ${isDarkMode 
          ? 'bg-gray-900 hover:bg-gray-800 border-red-800 text-red-400 hover:text-red-300' 
          : 'bg-amber-50 hover:bg-amber-100 border-red-200 text-red-600 hover:text-red-500'}
      `}
    >
      <Sun className={`
        h-5 w-5 transition-all duration-500 absolute
        ${isDarkMode 
          ? 'rotate-0 scale-100' 
          : 'rotate-90 scale-0'}
      `} />
      <Moon className={`
        h-5 w-5 transition-all duration-500 absolute
        ${isDarkMode 
          ? '-rotate-90 scale-0' 
          : 'rotate-0 scale-100'}
      `} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}