import { GameType, RPSChoice } from '@/lib/games';

export interface PlayerStats {
  wins: number;
  losses: number;
  pin?: string;
  password?: string;
}

export interface Match {
  winner: string;
  loser: string;
  winnerRatingChange: number;
  loserRatingChange: number;
  timestamp: string;
}

export interface PlayerData {
  name: string;
  rating: number;
  stats: PlayerStats;
}

export interface Challenge {
  id: string;
  challenger: string;
  challenged: string;
  game: GameType;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined' | 'resolved';
  challengerChoice?: RPSChoice;
  challengedChoice?: RPSChoice;
}

export interface KingOfHill {
  playerId: string;
  playerName: string;
  crownedAt: string;
}

export interface RPSResult {
  winner: string;
  loser: string;
  challengerChoice: RPSChoice;
  challengedChoice: RPSChoice;
  timestamp: string;
}