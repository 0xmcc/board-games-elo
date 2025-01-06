import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ChallengeService } from '@/services/challengeService';
import { MatchService } from '@/services/matchService';
import type { Match, Challenge } from '@/types/elo';

interface UseRealtimeSubscriptionsProps {
  onMatchesUpdate: (matches: Match[]) => void;
  onChallengesUpdate: (challenges: Challenge[]) => void;
  onPlayersUpdate: () => void;
}

export function useRealtimeSubscriptions({
  onMatchesUpdate,
  onChallengesUpdate,
  onPlayersUpdate,
}: UseRealtimeSubscriptionsProps) {
  useEffect(() => {
    // Subscribe to matches changes
    const matchesSubscription = supabase
      .channel('matches_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'matches'
        }, 
        async () => {
          try {
            const matches = await MatchService.getMatches();
            onMatchesUpdate(matches);
            // Also refresh players as ratings change with matches
            onPlayersUpdate();
          } catch (error) {
            console.error('Error updating matches:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to challenges changes
    const challengesSubscription = supabase
      .channel('challenges_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'challenges'
        }, 
        async () => {
          try {
            const challenges = await ChallengeService.getChallenges();
            onChallengesUpdate(challenges);
          } catch (error) {
            console.error('Error updating challenges:', error);
          }
        }
      )
      .subscribe();

    // Subscribe to player changes
    const playersSubscription = supabase
      .channel('players_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players'
        },
        () => {
          onPlayersUpdate();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      matchesSubscription.unsubscribe();
      challengesSubscription.unsubscribe();
      playersSubscription.unsubscribe();
    };
  }, [onMatchesUpdate, onChallengesUpdate, onPlayersUpdate]);
}