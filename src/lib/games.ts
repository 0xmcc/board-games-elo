export const GAMES = [
  { type: 'Rock Paper Scissors', emoji: '✂️' }
] as const;

export type GameType = typeof GAMES[number]['type'];
export type RPSChoice = 'rock' | 'paper' | 'scissors';

export function isValidGame(game: string): game is GameType {
  return GAMES.map(g => g.type).includes(game as GameType);
}

export function getGameEmoji(gameType: GameType): string {
  return GAMES.find(g => g.type === gameType)?.emoji || '🎮';
}

export function determineRPSWinner(choice1: RPSChoice, choice2: RPSChoice): 'player1' | 'player2' | 'tie' {
  if (choice1 === choice2) return 'tie';
  
  if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    return 'player1';
  }
  
  return 'player2';
}

export const RPS_EMOJIS: Record<RPSChoice, string> = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️'
};