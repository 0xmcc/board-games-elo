import React from 'react';
import { Button } from '@/components/ui/button';
import { TrophyIcon } from '@/components/icons';
import { toast } from 'sonner';
import { MatchService } from '@/services/matchService';

interface RecordMatchProps {
  players: Record<string, number>;
  player1: string;
  player2: string;
  setPlayer1: (name: string) => void;
  setPlayer2: (name: string) => void;
  onRecordGame: () => void;
}

export const RecordMatch: React.FC<RecordMatchProps> = ({
  players,
  player1,
  player2,
  setPlayer1,
  setPlayer2,
  onRecordGame
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleRecordGame = async () => {
    if (!player1 || !player2 || player1 === player2 || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Get player data
      const [winner, loser] = await MatchService.getPlayersForMatch(player1, player2);

      // Record the match
      await MatchService.recordMatch(winner, loser);

      // Success! Clear form and notify user
      toast.success('Match recorded successfully!');
      onRecordGame();
      setPlayer1('');
      setPlayer2('');
    } catch (error) {
      // Only show error if it's a real error
      if (error instanceof Error && error.message !== 'null') {
        console.error('Error recording match:', error);
        toast.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3 bg-red-50 p-4 rounded-lg border-2 border-red-100">
      <h3 className="font-bold text-red-800 text-center mb-2">Record Match Result</h3>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-red-800">
          {player1 ? `Winner: ${player1}` : 'Select Winner'}
        </label>
        <select 
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          className="w-full p-2 rounded border-2 border-red-200 bg-white"
          disabled={isSubmitting}
        >
          <option value="">Choose player...</option>
          {Object.keys(players).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-red-800">
          {player2 ? `Loser: ${player2}` : 'Select Loser'}
        </label>
        <select
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          className="w-full p-2 rounded border-2 border-red-200 bg-white"
          disabled={isSubmitting}
        >
          <option value="">Choose player...</option>
          {Object.keys(players).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <Button 
        onClick={handleRecordGame}
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={!player1 || !player2 || player1 === player2 || isSubmitting}
      >
        <TrophyIcon />
        {isSubmitting ? 'Recording...' : 'Record Game'}
      </Button>
    </div>
  );
};