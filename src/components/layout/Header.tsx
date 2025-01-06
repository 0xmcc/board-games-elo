import React from 'react';
import { DiceIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Download, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { Challenge } from '@/types/elo';

interface HeaderProps {
  onExport: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
  challenges: Challenge[];
}

export function Header({ onExport, onSignIn, onCreateAccount, challenges }: HeaderProps) {
  return (
    <div className="max-w-7xl mx-auto mb-8">
      <div className="flex justify-between items-center">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex items-center gap-3">
            <DiceIcon />
            <h1 className="text-4xl font-bold text-red-600 tracking-tight">GAME NIGHT</h1>
            <DiceIcon />
          </div>
          <p className="text-sm text-red-800 dark:text-red-400 font-medium mt-2">ELO RATING TRACKER</p>
        </div>

        {/* Right-aligned Controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserMenu challenges={challenges} />
          {!useAuth().isSignedIn && (
            <>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={onExport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={onCreateAccount}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                New Player
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={onSignIn}
              >
                <LogIn className="w-4 h-4 mr-2" />
               Existing Player
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}