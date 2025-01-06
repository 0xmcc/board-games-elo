import { RPSChoice } from './games';

export function validateRPSChoice(choice: string): choice is RPSChoice {
  return ['rock', 'paper', 'scissors'].includes(choice);
}

export function getRPSWinner(choice1: RPSChoice, choice2: RPSChoice): 'player1' | 'player2' | 'tie' {
  if (choice1 === choice2) return 'tie';
  
  const winningMoves = {
    rock: 'scissors',
    paper: 'rock',
    scissors: 'paper'
  };
  
  return winningMoves[choice1] === choice2 ? 'player1' : 'player2';
}