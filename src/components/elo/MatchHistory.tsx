import React from 'react';
import { Match } from '@/types/elo';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MatchHistoryProps {
  matches: Match[];
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ matches }) => {
  if (matches.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No matches recorded yet
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)] pr-4">
      <div className="space-y-3">
        {matches.map((match, index) => (
          <div 
            key={index} 
            className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <span className="font-medium text-green-600 dark:text-green-400">{match.winner}</span>
                <span className="text-gray-500 dark:text-gray-400"> defeated </span>
                <span className="font-medium text-red-600 dark:text-red-400">{match.loser}</span>
              </div>
              <div className="text-right text-xs">
                <div className="text-green-600 dark:text-green-400">+{match.winnerRatingChange}</div>
                <div className="text-red-600 dark:text-red-400">{match.loserRatingChange}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date(match.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};