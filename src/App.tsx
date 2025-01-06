import React from 'react';
import { DiceIcon } from '@/components/icons';
import { AddPlayer } from '@/components/elo/AddPlayer';
import { RecordMatch } from '@/components/elo/RecordMatch';
import { PlayerRankings } from '@/components/elo/PlayerRankings';
import { MatchHistory } from '@/components/elo/MatchHistory';
import { SignInDialog } from '@/components/auth/SignInDialog';
import { CreateAccountDialog } from '@/components/auth/CreateAccountDialog';
import { GameControls } from '@/components/elo/GameControls';
import { GameControlsFab } from '@/components/elo/GameControlsFab';
import { Duels } from '@/components/elo/Duels';
import { UserStats } from '@/components/elo/UserStats';
import { Header } from '@/components/layout/Header';
import { KingOfHill } from '@/components/elo/KingOfHill';
import { calculateNewRatings, DEFAULT_ELO } from '@/lib/elo';
import { STORAGE_KEYS } from '@/lib/storage';
import { exportToCSV } from '@/lib/export';
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { ChallengeService } from '@/services/challengeService';
import { KingService } from '@/services/kingService';
import { MatchService } from '@/services/matchService';
import { useRealtimeSubscriptions } from '@/hooks/useRealtimeSubscriptions';
import type { PlayerStats, Match, Challenge, GameType, KingOfHill as KingOfHillType } from '@/types/elo';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Undo2 } from 'lucide-react';

function App() {
  const { signedInPlayer, isSignedIn } = useAuth();
  const [players, setPlayers] = React.useState<Record<string, number>>({});
  const [playerStats, setPlayerStats] = React.useState<Record<string, PlayerStats>>({});
  const [matchHistory, setMatchHistory] = React.useState<Match[]>([]);
  const [challenges, setChallenges] = React.useState<Challenge[]>([]);
  const [currentKing, setCurrentKing] = React.useState<KingOfHillType | null>(null);
  const [newPlayerName, setNewPlayerName] = React.useState('');
  const [player1, setPlayer1] = React.useState('');
  const [player2, setPlayer2] = React.useState('');
  const [isSignInOpen, setIsSignInOpen] = React.useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = React.useState(false);
  const [isControlsOpen, setIsControlsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUndoLoading, setIsUndoLoading] = React.useState(false);

  // Fetch initial data
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch players
        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .order('rating', { ascending: false });

        if (playersError) throw playersError;

        const playersMap = playersData.reduce<Record<string, number>>((acc, player) => {
          acc[player.name] = player.rating;
          return acc;
        }, {});
        setPlayers(playersMap);

        // Fetch player stats
        const { data: statsData, error: statsError } = await supabase
          .from('player_stats')
          .select('*, players(name)');

        if (statsError) throw statsError;

        const statsMap = statsData.reduce<Record<string, PlayerStats>>((acc, stat) => {
          if (stat.players) {
            acc[stat.players.name] = {
              wins: stat.wins,
              losses: stat.losses,
              pin: stat.pin || undefined,
              password: stat.password || undefined
            };
          }
          return acc;
        }, {});
        setPlayerStats(statsMap);

        // Fetch match history
        const matches = await MatchService.getMatches();
        setMatchHistory(matches);

        // Fetch challenges
        const challenges = await ChallengeService.getChallenges();
        setChallenges(challenges);

        // Fetch current king
        const king = await KingService.getCurrentKing();
        setCurrentKing(king);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set up real-time subscriptions
  useRealtimeSubscriptions({
    onMatchesUpdate: (matches) => setMatchHistory(matches),
    onChallengesUpdate: (challenges) => setChallenges(challenges),
    onPlayersUpdate: async () => {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('rating', { ascending: false });

        if (error) throw error;

        const playersMap = data.reduce<Record<string, number>>((acc, player) => {
          acc[player.name] = player.rating;
          return acc;
        }, {});
        setPlayers(playersMap);
      } catch (error) {
        console.error('Error updating players:', error);
      }
    }
  });

  const handleCreateAccount = async (name: string, password: string, pin: string) => {
    try {
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({ name, rating: DEFAULT_ELO })
        .select()
        .single();

      if (playerError) throw playerError;

      const { error: statsError } = await supabase
        .from('player_stats')
        .insert({
          player_id: player.id,
          wins: 0,
          losses: 0,
          pin,
          password
        });

      if (statsError) throw statsError;

      toast.success('Account created successfully!');
      setIsCreateAccountOpen(false);
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    }
  };

  const handleExport = () => {
    const playerData = Object.entries(players).map(([name, rating]) => ({
      name,
      rating,
      stats: playerStats[name]
    }));
    exportToCSV(playerData, matchHistory, signedInPlayer === 'Marko');
  };

  const handleDeletePlayer = async (name: string) => {
    try {
      const { data: player, error: findError } = await supabase
        .from('players')
        .select('id')
        .eq('name', name)
        .single();

      if (findError) throw findError;

      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', player.id);

      if (deleteError) throw deleteError;

      toast.success('Player deleted successfully');
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error('Failed to delete player');
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) return;

    try {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      await handleCreateAccount(newPlayerName, 'commons123', pin);
      setNewPlayerName('');
      toast.success(`Player added successfully! PIN: ${pin}`);
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error('Failed to add player');
    }
  };

  const handleRecordGame = async () => {
    if (!player1 || !player2 || player1 === player2) return;

    try {
      // Get player data
      const [winner, loser] = await MatchService.getPlayersForMatch(player1, player2);

      // Record the match
      await MatchService.recordMatch(winner, loser);

      setPlayer1('');
      setPlayer2('');
      setIsControlsOpen(false);
      toast.success('Match recorded successfully!');
    } catch (error) {
      // Only show error if it's a real error
      if (error instanceof Error && error.message !== 'null') {
        console.error('Error recording match:', error);
        toast.error(error.message);
      }
    }
  };

  const handleUndoLastMatch = async () => {
    if (!signedInPlayer || signedInPlayer !== 'Marko') {
      toast.error('Only Marko can undo matches');
      return;
    }

    if (matchHistory.length === 0) {
      toast.error('No matches to undo');
      return;
    }

    try {
      setIsUndoLoading(true);
      await MatchService.undoLastMatch();
      toast.success('Last match undone successfully');
    } catch (error) {
      console.error('Error undoing match:', error);
      toast.error('Failed to undo match');
    } finally {
      setIsUndoLoading(false);
    }
  };

  const handleChallenge = async (challenged: string, game: GameType) => {
    if (!signedInPlayer) return;
    
    try {
      await ChallengeService.createChallenge(signedInPlayer, challenged, game);
      toast.success('Challenge sent! ⚔️');
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create challenge');
    }
  };

  const handleChallengeResponse = async (challengeId: string, accept: boolean) => {
    try {
      await ChallengeService.updateChallengeStatus(challengeId, accept ? 'accepted' : 'declined');
      toast.success(accept ? 'Challenge accepted! 🤝' : 'Challenge declined ❌');
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast.error('Failed to update challenge');
    }
  };

  const handleReset = async () => {
    try {
      const { error: matchesError } = await supabase
        .from('matches')
        .delete()
        .neq('id', '');
      if (matchesError) throw matchesError;

      const { error: statsError } = await supabase
        .from('player_stats')
        .delete()
        .neq('id', '');
      if (statsError) throw statsError;

      const { error: playersError } = await supabase
        .from('players')
        .delete()
        .neq('id', '');
      if (playersError) throw playersError;

      toast.success('All data has been reset');
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Failed to reset data');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 dark:bg-[#181a1b] flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <DiceIcon />
          <p className="mt-4 text-red-600 dark:text-red-400">Loading game data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-amber-50 dark:bg-[#181a1b] p-4 md:p-8 transition-colors duration-200">
        <Header
          onExport={handleExport}
          onSignIn={() => setIsSignInOpen(true)}
          onCreateAccount={() => setIsCreateAccountOpen(true)}
          challenges={challenges}
        />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rankings with User Stats */}
          <div>
            <div className="flex justify-end mb-4">
              <KingOfHill king={currentKing} />
            </div>
            {isSignedIn && <UserStats playerStats={playerStats} />}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-red-600 dark:border-red-800 p-6">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 text-center mb-6">Rankings</h2>
              <PlayerRankings
                players={players}
                playerStats={playerStats}
                onDeletePlayer={handleDeletePlayer}
                signedInPlayer={signedInPlayer}
              />
            </div>
          </div>

          {/* Match History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-red-600 dark:border-red-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Match History</h2>
              <div className="flex items-center gap-2">
                {signedInPlayer === 'Marko' && matchHistory.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndoLastMatch}
                    disabled={isUndoLoading}
                    className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Undo2 className="w-4 h-4 mr-2" />
                    Undo Last
                  </Button>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {matchHistory.length} {matchHistory.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
            </div>
            <MatchHistory matches={matchHistory} />
          </div>

          {/* Duels */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-red-600 dark:border-red-800 p-6">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 text-center mb-6">Duels</h2>
            <Duels
              players={players}
              challenges={challenges}
              onChallenge={handleChallenge}
              onAcceptChallenge={(id) => handleChallengeResponse(id, true)}
              onDeclineChallenge={(id) => handleChallengeResponse(id, false)}
            />
          </div>
        </div>
      </div>

      {/* Game Controls */}
      <GameControls
        open={isControlsOpen}
        onOpenChange={setIsControlsOpen}
        newPlayerName={newPlayerName}
        setNewPlayerName={setNewPlayerName}
        onAddPlayer={handleAddPlayer}
        onPinGenerated={(pin) => {
          if (newPlayerName.trim()) {
            setPlayerStats(prev => ({
              ...prev,
              [newPlayerName]: { wins: 0, losses: 0, pin }
            }));
          }
        }}
        players={players}
        player1={player1}
        player2={player2}
        setPlayer1={setPlayer1}
        setPlayer2={setPlayer2}
        onRecordGame={handleRecordGame}
        onReset={handleReset}
      />

      {/* FAB for Game Controls */}
      <GameControlsFab onClick={() => setIsControlsOpen(true)} />

      <SignInDialog
        open={isSignInOpen}
        onOpenChange={setIsSignInOpen}
        playerStats={playerStats}
      />

      <CreateAccountDialog
        open={isCreateAccountOpen}
        onOpenChange={setIsCreateAccountOpen}
        onCreateAccount={handleCreateAccount}
      />
      
      <Toaster position="top-center" />
    </>
  );
}

export default App;