import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { GAMES, GameType, determineRPSWinner, RPSChoice } from '@/lib/games';
import { Challenge } from '@/types/elo';
import { Swords, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { ChallengeService } from '@/services/challengeService';
import { RPSChallenge } from './rps/RPSChallenge';

interface DuelsProps {
  players: Record<string, number>;
  challenges: Challenge[];
  onChallenge: (challenged: string, game: GameType) => void;
}

export const Duels: React.FC<DuelsProps> = ({
  players,
  challenges,
  onChallenge,
}) => {
  const { signedInPlayer, isSignedIn } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = React.useState('');
  const [hiddenChallenges, setHiddenChallenges] = React.useState<Set<string>>(new Set());

  const handleChallenge = () => {
    if (selectedPlayer) {
      onChallenge(selectedPlayer, 'Rock Paper Scissors');
      setSelectedPlayer('');
    }
  };

  const handleRPSChoice = async (challengeId: string, choice: RPSChoice) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge || !signedInPlayer) return;

      const isChallenger = challenge.challenger === signedInPlayer;
      
      await ChallengeService.updateRPSChoice(
        challengeId,
        choice,
        isChallenger ? 'challenger' : 'challenged'
      );

      // If both players have made their choices, determine the winner
      if (
        challenge.challengerChoice && 
        challenge.challengedChoice
      ) {
        const result = determineRPSWinner(
          challenge.challengerChoice,
          challenge.challengedChoice
        );

        if (result !== 'tie') {
          const winner = result === 'player1' ? challenge.challenger : challenge.challenged;
          const loser = result === 'player1' ? challenge.challenged : challenge.challenger;
          
          await ChallengeService.resolveRPSChallenge(challengeId, winner, loser);
          toast.success(`${winner} wins! 🎉`);
        } else {
          toast.info("It's a tie! Play again!");
          await ChallengeService.resetRPSChallenge(challengeId);
        }
      } else {
        toast.success('Move recorded! Waiting for opponent...');
      }
    } catch (error) {
      console.error('Error in RPS game:', error);
      toast.error('Failed to process move');
    }
  };

  const handleDelete = async (challengeId: string) => {
    try {
      setHiddenChallenges(prev => new Set([...prev, challengeId]));
      await ChallengeService.deleteChallenge(challengeId);
      toast.success('Challenge deleted successfully');
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
      setHiddenChallenges(prev => {
        const newSet = new Set(prev);
        newSet.delete(challengeId);
        return newSet;
      });
    }
  };

  // Filter only pending challenges where the user is involved
  const pendingChallenges = challenges.filter(challenge => {
    if (!isSignedIn || !signedInPlayer) return false;
    if (hiddenChallenges.has(challenge.id)) return false;
    if (challenge.status !== 'pending') return false;
    
    return challenge.challenger === signedInPlayer || 
           challenge.challenged === signedInPlayer;
  });

  if (!isSignedIn) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Sign in to view and create challenges
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-red-800 dark:text-red-200">Challenge Player</label>
          <div className="flex flex-col gap-2">
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(players)
                  .filter(name => name !== signedInPlayer)
                  .map(name => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleChallenge}
              disabled={!selectedPlayer}
              className="w-40 bg-blue-600 hover:bg-blue-700"
            >
              <Swords className="w-4 h-4 mr-2" />
              Challenge
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-red-800 dark:text-red-200">Active Challenges</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
            <Lock className="w-3 h-3" />
            Challenges are private and only visible to you and your challengers
          </p>
          <div className="mt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pendingChallenges.length} pending {pendingChallenges.length === 1 ? 'challenge' : 'challenges'}
            </span>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-500px)]">
          {pendingChallenges.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No pending challenges ✂️</p>
          ) : (
            <div className="space-y-3">
              {pendingChallenges.map(challenge => {
                const isChallenger = challenge.challenger === signedInPlayer;
                const myChoice = isChallenger ? challenge.challengerChoice : challenge.challengedChoice;
                const opponentChoice = isChallenger ? challenge.challengedChoice : challenge.challengerChoice;
                
                return (
                  <RPSChallenge
                    key={challenge.id}
                    challenger={challenge.challenger}
                    challenged={challenge.challenged}
                    timestamp={challenge.timestamp}
                    isChallenger={isChallenger}
                    myChoice={myChoice}
                    opponentChoice={opponentChoice}
                    onMakeChoice={(choice) => handleRPSChoice(challenge.id, choice)}
                    onDelete={() => handleDelete(challenge.id)}
                  />
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}