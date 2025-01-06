import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { PlayerStats } from '@/types/elo';

interface UserStatsProps {
  playerStats: Record<string, PlayerStats>;
}

export const UserStats: React.FC<UserStatsProps> = ({ playerStats }) => {
  const { signedInPlayer } = useAuth();
  
  if (!signedInPlayer) return null;
  
  const stats = playerStats[signedInPlayer] || { wins: 0, losses: 0 };
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? ((stats.wins / totalGames) * 100).toFixed(1) : '0.0';

  return (
    <div className="mb-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
          <div className="text-sm text-gray-600">Wins</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
          <div className="text-sm text-gray-600">Losses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{winRate}%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </div>
      </div>
    </div>
  );
};