import { supabase } from './supabase';
import type { Database } from '@/types/supabase';
import type { PlayerStats, Match, Challenge, GameType } from '@/types/elo';

type Tables = Database['public']['Tables'];
type Player = Tables['players']['Row'];
type PlayerStat = Tables['player_stats']['Row'];
type DbMatch = Tables['matches']['Row'];
type DbChallenge = Tables['challenges']['Row'];

export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('rating', { ascending: false });

  if (error) throw error;
  return data.reduce<Record<string, number>>((acc, player) => {
    acc[player.name] = player.rating;
    return acc;
  }, {});
}

export async function getPlayerStats() {
  const { data, error } = await supabase
    .from('player_stats')
    .select('*, players(name)');

  if (error) throw error;
  return data.reduce<Record<string, PlayerStats>>((acc, stat) => {
    if (stat.players) {
      acc[stat.players.name] = {
        wins: stat.wins,
        losses: stat.losses,
        pin: stat.pin || undefined,
        password: stat.password || undefined,
        approved: stat.approved
      };
    }
    return acc;
  }, {});
}

export async function getAvailablePlayers() {
  const { data, error } = await supabase
    .from('player_stats')
    .select('*, players!inner(name)');

  if (error) throw error;
  return data.map(stat => ({
    name: stat.players?.name || '',
    pin: stat.pin || ''
  }));
}

export async function getMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*, winner:winner_id(name), loser:loser_id(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map<Match>(match => ({
    winner: match.winner?.name || '',
    loser: match.loser?.name || '',
    winnerRatingChange: match.winner_rating_change,
    loserRatingChange: match.loser_rating_change,
    timestamp: match.created_at
  }));
}

export async function getChallenges() {
  const { data, error } = await supabase
    .from('challenges')
    .select('*, challenger:challenger_id(name), challenged:challenged_id(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map<Challenge>(challenge => ({
    id: challenge.id,
    challenger: challenge.challenger?.name || '',
    challenged: challenge.challenged?.name || '',
    game: challenge.game as GameType,
    timestamp: challenge.created_at,
    status: challenge.status as Challenge['status']
  }));
}

export async function createPlayer(name: string, pin?: string, password?: string) {
  // First, create the player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({ name, rating: 1200 })
    .select()
    .single();

  if (playerError) {
    console.error('Error creating player:', playerError);
    throw playerError;
  }

  // Then, create their stats
  const { error: statsError } = await supabase
    .from('player_stats')
    .insert({
      player_id: player.id,
      wins: 0,
      losses: 0,
      pin,
      password,
      approved: password === 'commons123' // Auto-approve if correct password
    });

  if (statsError) {
    console.error('Error creating player stats:', statsError);
    // Clean up the player if stats creation fails
    await supabase.from('players').delete().eq('id', player.id);
    throw statsError;
  }

  return player;
}

export async function updatePlayerRating(playerId: string, newRating: number) {
  const { error } = await supabase
    .from('players')
    .update({ rating: newRating })
    .eq('id', playerId);

  if (error) throw error;
}

export async function createMatch(
  winnerId: string,
  loserId: string,
  winnerRatingChange: number,
  loserRatingChange: number
) {
  const { error } = await supabase
    .from('matches')
    .insert({
      winner_id: winnerId,
      loser_id: loserId,
      winner_rating_change: winnerRatingChange,
      loser_rating_change: loserRatingChange
    });

  if (error) throw error;
}

export async function createChallenge(
  challengerId: string,
  challengedId: string,
  game: GameType
) {
  const { error } = await supabase
    .from('challenges')
    .insert({
      challenger_id: challengerId,
      challenged_id: challengedId,
      game
    });

  if (error) throw error;
}

export async function updateChallengeStatus(
  challengeId: string,
  status: Challenge['status']
) {
  const { error } = await supabase
    .from('challenges')
    .update({ status })
    .eq('id', challengeId);

  if (error) throw error;
}