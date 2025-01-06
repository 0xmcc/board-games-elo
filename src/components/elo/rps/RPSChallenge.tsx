import React from 'react';
import { RPSGame } from './RPSGame';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { getRelativeTime } from '@/lib/time';
import type { RPSChallengeProps } from './types';

export function RPSChallenge({
  challenger,
  challenged,
  timestamp,
  isChallenger,
  myChoice,
  opponentChoice,
  onMakeChoice,
  onDelete
}: RPSChallengeProps) {
  return (
    <div className="p-4 rounded-lg border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium">
              <span className="text-blue-600 dark:text-blue-400">{challenger}</span>
              <span className="text-gray-600 dark:text-gray-400"> challenged </span>
              <span className="text-red-600 dark:text-red-400">{challenged}</span>
            </p>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {getRelativeTime(timestamp)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <RPSGame
            onSelect={onMakeChoice}
            selectedChoice={myChoice}
            disabled={!!myChoice}
          />
          
          {opponentChoice && (
            <p className="text-sm text-gray-600 dark:text-gray-400 animate-fade-in">
              Opponent has made their choice!
            </p>
          )}
        </div>

        {isChallenger && onDelete && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Challenge
          </Button>
        )}
      </div>
    </div>
  );
}