import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CrownIcon, TrashIcon } from '@/components/icons';
import { PlayerStats } from '@/types/elo';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface PlayerRankingsProps {
  players: Record<string, number>;
  playerStats: Record<string, PlayerStats>;
  onDeletePlayer: (name: string) => void;
  signedInPlayer: string | null;
}

export const PlayerRankings: React.FC<PlayerRankingsProps> = ({
  players,
  playerStats,
  onDeletePlayer,
  signedInPlayer,
}) => {
  const { isSignedIn } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const debouncedSearch = useDebounce(searchQuery);

  const getWinRate = (playerName: string) => {
    const stats = playerStats[playerName];
    if (!stats) return '0.0';
    const total = stats.wins + stats.losses;
    return total > 0 ? ((stats.wins / total) * 100).toFixed(1) : '0.0';
  };

  if (Object.keys(players).length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No players added yet
      </div>
    );
  }

  const sortedPlayers = Object.entries(players)
    .sort(([, a], [, b]) => b - a)
    .map(([name, rating]) => ({
      name,
      rating,
      stats: playerStats[name] || { wins: 0, losses: 0 },
    }));

  const top3Players = sortedPlayers.slice(0, 3);
  const remainingPlayers = sortedPlayers.slice(3);
  const signedInPlayerData = remainingPlayers.find(p => p.name === signedInPlayer);
  
  const filteredPlayers = sortedPlayers
    .filter(p => p.name !== signedInPlayer)
    .filter(p => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const renderPlayerCard = (player: typeof sortedPlayers[0], index: number, isTop3: boolean = false) => (
    <div
      key={player.name}
      className={`flex justify-between items-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        index === 0 && isTop3 
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-700' 
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center gap-2">
        {index === 0 && isTop3 && <CrownIcon />}
        <div className="flex flex-col">
          <span className="font-medium dark:text-gray-100">{player.name}</span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {player.stats.wins}W - {player.stats.losses}L
            ({getWinRate(player.name)}% WR)
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold text-lg dark:text-gray-100">{player.rating}</span>
        {signedInPlayer === player.name && (
          <Button
            onClick={() => onDeletePlayer(player.name)}
            variant="ghost"
            className="h-8 w-8 p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
            title={`Delete ${player.name}`}
          >
            <TrashIcon />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top 3 Players - Only show when not searching */}
      {!debouncedSearch && (
        <div className="space-y-3">
          {top3Players.map((player, index) => renderPlayerCard(player, index, true))}
        </div>
      )}

      {/* Players List */}
      {isSignedIn ? (
        <div className="relative mt-6">
          <ScrollArea className="h-[calc(100vh-600px)]">
            <div className="space-y-3">
              {signedInPlayerData && !debouncedSearch && renderPlayerCard(signedInPlayerData, -1)}
              {debouncedSearch ? (
                filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => renderPlayerCard(player, -1))
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No players found matching "{searchQuery}"
                  </div>
                )
              ) : (
                remainingPlayers
                  .filter(p => p.name !== signedInPlayer)
                  .map((player) => renderPlayerCard(player, -1))
              )}
            </div>
          </ScrollArea>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-red-200 dark:border-red-800 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>
      ) : (
        /* Signed Out View with Blurred Players */
        <div className="relative mt-6">
          <div className="space-y-3 filter blur-[4px] opacity-50 pointer-events-none">
            {remainingPlayers.slice(0, 3).map((player) => renderPlayerCard(player, -1))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                SF Commons Members Only
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sign in to view more.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};