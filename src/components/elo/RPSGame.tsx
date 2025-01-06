import React from 'react';
import { Button } from '@/components/ui/button';
import { RPS_EMOJIS, RPSChoice } from '@/lib/games';
import { cn } from '@/lib/utils';

interface RPSGameProps {
  onSelect: (choice: RPSChoice) => void;
  selectedChoice?: RPSChoice;
  disabled?: boolean;
}

export function RPSGame({ onSelect, selectedChoice, disabled }: RPSGameProps) {
  const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {choices.map((choice) => (
          <Button
            key={choice}
            onClick={() => onSelect(choice)}
            disabled={disabled || selectedChoice !== undefined}
            className={cn(
              "h-16 w-16 text-2xl",
              selectedChoice === choice && "ring-2 ring-red-500 dark:ring-red-400",
              disabled && "opacity-50"
            )}
            variant={selectedChoice === choice ? "default" : "outline"}
          >
            {RPS_EMOJIS[choice]}
          </Button>
        ))}
      </div>
      {selectedChoice && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          You chose {RPS_EMOJIS[selectedChoice]}
        </p>
      )}
    </div>
  );
}