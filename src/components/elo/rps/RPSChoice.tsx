import React from 'react';
import { Button } from '@/components/ui/button';
import { RPS_EMOJIS, RPSChoice } from '@/lib/games';
import { cn } from '@/lib/utils';

interface RPSChoiceButtonProps {
  choice: RPSChoice;
  selected?: boolean;
  disabled?: boolean;
  onSelect: (choice: RPSChoice) => void;
}

export function RPSChoiceButton({ choice, selected, disabled, onSelect }: RPSChoiceButtonProps) {
  return (
    <Button
      onClick={() => onSelect(choice)}
      disabled={disabled}
      className={cn(
        "h-16 w-16 text-2xl transition-all",
        selected && "ring-2 ring-red-500 dark:ring-red-400 scale-110",
        disabled && "opacity-50"
      )}
      variant={selected ? "default" : "outline"}
    >
      {RPS_EMOJIS[choice]}
    </Button>
  );
}