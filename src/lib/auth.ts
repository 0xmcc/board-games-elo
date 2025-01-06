import { supabase } from './supabase';

export async function signInWithPin(username: string, pin: string) {
  try {
    // Verify the PIN against player_stats
    const { data: playerStats, error: pinCheckError } = await supabase
      .from('player_stats')
      .select('*, players!inner(*)')
      .eq('players.name', username)
      .single();

    if (pinCheckError) {
      throw new Error('Player not found');
    }

    if (!playerStats || playerStats.pin !== pin) {
      throw new Error('Invalid PIN');
    }

    // If PIN matches, consider the user authenticated
    return {
      user: {
        id: playerStats.player_id,
        user_metadata: {
          username: playerStats.players.name
        }
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  // Simple sign out - just clear the session
  return { error: null };
}

export async function getCurrentUser() {
  // No session management needed
  return null;
}