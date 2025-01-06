import { supabase } from '@/lib/supabase';
import type { KingOfHill } from '@/types/elo';

export class KingService {
  static async getCurrentKing(): Promise<KingOfHill | null> {
    const { data, error } = await supabase.rpc('get_current_king');

    if (error) {
      console.error('Error fetching current king:', error);
      throw new Error(`Failed to fetch current king: ${error.message}`);
    }

    if (!data || !data.length) return null;

    return {
      playerId: data[0].player_id,
      playerName: data[0].player_name,
      crownedAt: data[0].crowned_at
    };
  }
}