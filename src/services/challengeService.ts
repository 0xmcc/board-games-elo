import { supabase } from '@/lib/supabase';
import { GameType, RPSChoice } from '@/lib/games';
import type { Challenge } from '@/types/elo';

export class ChallengeService {
  static async createChallenge(challenger: string, challenged: string, game: GameType): Promise<void> {
    try {
      // Get player IDs
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name')
        .in('name', [challenger, challenged]);

      if (playersError) {
        console.error('Players query error:', playersError);
        throw new Error(`Failed to find players: ${playersError.message}`);
      }

      if (!players || players.length !== 2) {
        throw new Error(`Could not find both players: ${challenger} and ${challenged}`);
      }

      const challengerPlayer = players.find(p => p.name === challenger);
      const challengedPlayer = players.find(p => p.name === challenged);

      if (!challengerPlayer || !challengedPlayer) {
        throw new Error('Could not match player names to IDs');
      }

      // Check for existing pending challenges between these players
      const { data: existingChallenges, error: checkError } = await supabase
        .from('challenges')
        .select('*')
        .eq('challenger_id', challengerPlayer.id)
        .eq('challenged_id', challengedPlayer.id)
        .eq('status', 'pending');

      if (checkError) throw checkError;

      if (existingChallenges && existingChallenges.length > 0) {
        throw new Error('A pending challenge already exists between these players');
      }

      // Create the challenge
      const { error: challengeError } = await supabase
        .from('challenges')
        .insert({
          challenger_id: challengerPlayer.id,
          challenged_id: challengedPlayer.id,
          game,
          status: 'pending'
        });

      if (challengeError) {
        console.error('Challenge creation error:', challengeError);
        throw new Error(`Failed to create challenge: ${challengeError.message}`);
      }
    } catch (error) {
      console.error('Error in createChallenge:', error);
      throw error;
    }
  }

  static async getChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*, challenger:challenger_id(name), challenged:challenged_id(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching challenges:', error);
      throw new Error(`Failed to fetch challenges: ${error.message}`);
    }

    return data.map(challenge => ({
      id: challenge.id,
      challenger: challenge.challenger?.name || '',
      challenged: challenge.challenged?.name || '',
      game: challenge.game as GameType,
      timestamp: challenge.created_at,
      status: challenge.status as Challenge['status'],
      challengerChoice: challenge.challenger_choice as RPSChoice | undefined,
      challengedChoice: challenge.challenged_choice as RPSChoice | undefined
    }));
  }

  static async updateRPSChoice(
    challengeId: string,
    choice: RPSChoice,
    player: 'challenger' | 'challenged'
  ): Promise<void> {
    const column = `${player}_choice`;
    
    const { error } = await supabase
      .from('challenges')
      .update({ [column]: choice })
      .eq('id', challengeId);

    if (error) {
      console.error('Error updating RPS choice:', error);
      throw new Error(`Failed to update choice: ${error.message}`);
    }
  }

  static async resolveRPSChallenge(
    challengeId: string,
    winner: string,
    loser: string
  ): Promise<void> {
    try {
      // Get player IDs
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('id, name')
        .in('name', [winner, loser]);

      if (playersError || !players || players.length !== 2) {
        throw new Error('Failed to find players');
      }

      const winnerId = players.find(p => p.name === winner)?.id;
      const loserId = players.find(p => p.name === loser)?.id;

      if (!winnerId || !loserId) {
        throw new Error('Could not match player names to IDs');
      }

      // Call the stored procedure to handle the game resolution
      const { error: rpsError } = await supabase.rpc('resolve_rps_challenge', {
        challenge_id_param: challengeId,
        winner_id_param: winnerId,
        loser_id_param: loserId
      });

      if (rpsError) {
        throw rpsError;
      }
    } catch (error) {
      console.error('Error resolving RPS challenge:', error);
      throw error;
    }
  }

  static async resetRPSChallenge(challengeId: string): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .update({
        challenger_choice: null,
        challenged_choice: null
      })
      .eq('id', challengeId);

    if (error) {
      console.error('Error resetting RPS challenge:', error);
      throw new Error(`Failed to reset challenge: ${error.message}`);
    }
  }

  static async deleteChallenge(challengeId: string): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId);

    if (error) {
      console.error('Error deleting challenge:', error);
      throw new Error(`Failed to delete challenge: ${error.message}`);
    }
  }
}