import { supabase } from '@/lib/supabase';
import { calculateNewRatings } from '@/lib/elo';
import type { Match } from '@/types/elo';

interface PlayerData {
  id: string;
  name: string;
  rating: number;
}

export class MatchService {
  static async getMatches(): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*, winner:winner_id(name), loser:loser_id(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching matches:', error);
      throw new Error(`Failed to fetch matches: ${error.message}`);
    }

    return data.map(match => ({
      winner: match.winner?.name || '',
      loser: match.loser?.name || '',
      winnerRatingChange: match.winner_rating_change,
      loserRatingChange: match.loser_rating_change,
      timestamp: match.created_at
    }));
  }

  static async getPlayersForMatch(player1: string, player2: string): Promise<[PlayerData, PlayerData]> {
    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('id, name, rating')
      .in('name', [player1, player2]);

    if (playerError) {
      throw new Error(`Failed to fetch players: ${playerError.message}`);
    }

    if (!playerData || playerData.length !== 2) {
      throw new Error('Could not find both players');
    }

    const winner = playerData.find(p => p.name === player1);
    const loser = playerData.find(p => p.name === player2);

    if (!winner || !loser) {
      throw new Error('Could not match players');
    }

    return [winner, loser];
  }

  static async recordMatch(winner: PlayerData, loser: PlayerData): Promise<void> {
    try {
      const ratingChanges = calculateNewRatings(winner.rating, loser.rating);
      const newWinnerRating = winner.rating + ratingChanges.winner;
      const newLoserRating = loser.rating + ratingChanges.loser;

      const response = await supabase.rpc('record_match', {
        winner_id_param: winner.id,
        loser_id_param: loser.id,
        winner_rating_change_param: ratingChanges.winner,
        loser_rating_change_param: ratingChanges.loser,
        new_winner_rating_param: newWinnerRating,
        new_loser_rating_param: newLoserRating
      });

      if (response.error) {
        throw response.error;
      }
    } catch (error) {
      if (error instanceof Error && error.message !== 'null') {
        console.error('Match recording error:', error);
        throw new Error(
          error instanceof Error 
            ? `Failed to record match: ${error.message}`
            : 'Failed to record match. Please try again.'
        );
      }
    }
  }

  static async undoLastMatch(): Promise<void> {
    try {
      const { data, error } = await supabase.rpc('undo_last_match');
      
      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Failed to undo match');
      }
    } catch (error) {
      console.error('Error in undoLastMatch:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to undo match. Please try again.'
      );
    }
  }
}