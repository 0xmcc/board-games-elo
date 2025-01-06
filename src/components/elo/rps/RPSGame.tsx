import React from 'react';
import { RPSChoiceButton } from './RPSChoice';
import { RPSChoice } from '@/lib/games';
import { RPS_EMOJIS } from '@/lib/games';
import type { RPSGameProps } from './types';

export function RPSGame({ onSelect, selectedChoice, disabled }: RPSGameProps) {
  const choices: RPSChoice[] = ['rock', 'paper', 'scissors'];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {choices.map((choice) => (
          <RPSChoiceButton
            key={choice}
            choice={choice}
            selected={selectedChoice === choice}
            disabled={disabled || selectedChoice !== undefined}
            onSelect={onSelect}
          />
        ))}
      </div>
      {selectedChoice && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
          You chose {RPS_EMOJIS[selectedChoice]}
        </p>
      )}
    </div>
  );
}