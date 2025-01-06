import React from 'react';
import { Button } from '@/components/ui/button';
import { DiceIcon } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';

interface GameControlsFabProps {
  onClick: () => void;
}

export const GameControlsFab: React.FC<GameControlsFabProps> = ({ onClick }) => {
  const { signedInPlayer } = useAuth();

  // Only show FAB if user is Marko
  if (signedInPlayer !== 'Marko') return null;

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg"
      size="icon"
    >
      <DiceIcon />
    </Button>
  );
};